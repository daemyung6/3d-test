import * as THREE from './build/three.module.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import * as app from './app.js';


function createBox(pos, quat, w, l, h, mass, friction) {
    var material = mass > 0 ? materialDynamic : materialStatic;
    var shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);
    var geometry = new Ammo.btBoxShape(new Ammo.btVector3(w * 0.5, l * 0.5, h * 0.5));

    if(!mass) mass = 0;
    if(!friction) friction = 1;

    var mesh = new THREE.Mesh(shape, material);
    mesh.position.copy(pos);
    mesh.quaternion.copy(quat);
    scene.add( mesh );

    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    var motionState = new Ammo.btDefaultMotionState(transform);

    var localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(mass, localInertia);

    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, geometry, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(friction);
    // body.setRestitution(.9);
    // body.setDamping(0.2, 0.2);

    physicsWorld.addRigidBody( body );

    if (mass > 0) {
        body.setActivationState(DISABLE_DEACTIVATION);
        // Sync physics and graphics
        function sync(dt) {
            var ms = body.getMotionState();
            if (ms) {
                ms.getWorldTransform(TRANSFORM_AUX);
                var p = TRANSFORM_AUX.getOrigin();
                var q = TRANSFORM_AUX.getRotation();
                mesh.position.set(p.x(), p.y(), p.z());
                mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
        }

        syncList.push(sync);
    }
}



export default function () {
    const that = this;

    this.FBX = {}
    let anime = [];
    const FBXList = [
        './fbx/standing.fbx',
        './fbx/run.fbx'
    ]
    let FBXloadCount = 0;
    for (let i = 0; i < FBXList.length; i++) {
        const id = i;

        let loader = new FBXLoader();
        loader.load(FBXList[id], function (fbxData) {
            FBXloadCount++;
            let pathArr = FBXList[id].split('/');
            let name = pathArr[pathArr.length - 1].split('.')[0];
            that.FBX[name] = fbxData;

            if (FBXList.length === FBXloadCount) {
                loadDone();
                that.onload();

                
            }
        });
    }

    this.onload = function() {}

    this.update = function() {}

    function loadDone() {
        console.log(that)
        const clock = new THREE.Clock();
        const mixer = new THREE.AnimationMixer( that.FBX.standing );

        const standing = mixer.clipAction( that.FBX.standing.animations[0] );
        anime.push(standing);
        standing.play()
      
        const run = mixer.clipAction( that.FBX.run.animations[0] );
        anime.push(run);
        run.play()

        let keys = {
            w : false,
            s : false,
            a : false,
            d : false,
        }

        window.addEventListener('keydown', function(e) {    
            if(typeof keys[e.key] === 'boolean') {
                keys[e.key] = true;
            }
        })
        window.addEventListener('keyup', function(e) {    
            if(typeof keys[e.key] === 'boolean') {
                keys[e.key] = false;
            }
        })

        let speed = 0;
        const maxSpeed = 5; 

        const quaternion = new THREE.Quaternion();
        
        window.test = that.FBX.standing;

        const moveX = 100;
        const moveZ = 100;

        app.scene.add(that.FBX.standing);
        app.renderList.push(function() {
            if(keys.w) { 
                speed += 0.5;
                if(speed > maxSpeed ) { speed = maxSpeed; }
            }
            else {
                speed -= 0.3;
            }

            if(speed < 0) { speed = 0; }
            if(keys.s) {

            }
            if(keys.a) {
                that.FBX.standing.rotation.y +=  0.1;
                if(that.FBX.standing.rotation.y > Math.PI * 2) { that.FBX.standing.rotation.y = 0 }
            }
            if(keys.d) {
                that.FBX.standing.rotation.y -=  0.1;
                if(that.FBX.standing.rotation.y < 0) { that.FBX.standing.rotation.y = Math.PI * 2 }
            }

            that.FBX.standing.position.x += Math.sin(that.FBX.standing.rotation.y) * speed;
            that.FBX.standing.position.z += Math.cos(that.FBX.standing.rotation.y) * speed;

            mixer.update( clock.getDelta() );
            anime[0].weight = 1 - (speed / maxSpeed);
            anime[1].weight = (speed / maxSpeed);
        });
    }
}