import * as THREE from './build/three.module.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';

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


        that.update = function() {
            mixer.update( clock.getDelta() );
            anime[0].weight = 1 - Number(input.value) / 100;
            anime[1].weight = Number(input.value) / 100;
        }
    }

    const input = document.createElement('input');
    input.style.cssText = `
        position: absolute;
        top: 0px;
    `
    input.setAttribute('type', 'range');
    document.body.appendChild(input);

}