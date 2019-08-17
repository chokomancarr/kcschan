var skinning_shad = null;

function createSkinnedMeshRenderer() {
    return {
        name : "Skinned Mesh Renderer",
        ctype : 3,
        obj : null,
        mesh : null,
        arma : null,
        tex : null,
        datTex : null,

        createDatTex : function(gl) {
            var noweights = 0;
            const dat = new Float32Array(this.mesh.vcnt * 8);
            for (let i = 0; i < this.mesh.vcnt; i++) {
                var a = 0;
                var sw = 0;
                const ws = this.mesh.data.allGrpWts[i];
                for (let g = 0; g < ws.length; g++) {
                    const w = ws[g];
                    if (w == 0) continue;
                    const bi = this.arma.mapBone(this.mesh.data.allGrpNms[w.id]);
                    if (bi == -1) continue;
                    dat[i*8 + a] = bi;
                    dat[i*8 + 4 + a] = w.val;
                    a ++;
                    sw += w.val;
                    if (a >= 4) break;
                }
                if (!sw) noweights ++;
                for (let n = 0; n < a; n++) {
                    dat[i*8 + 4 + n] /= sw;
                }
            }
            if (noweights > 0) {
                console_warn(noweights + " vertices with no weights assigned!");
            }
            console_log("gen for " + this.obj.name);
            this.datTex = createBufTexture(gl, dat);
        },
        skin : function(gl) {
            if (!skinning_shad) return;
            skinning_shad.bind([
                this.mesh.vbos[0].pointer,
                this.mesh.vbos[1].pointer,
                this.mesh.vbos[2].pointer
            ]);
            gl.uniform1i(skinning_shad.uniforms[0], this.mesh.vcnt);
            gl.uniform1i(skinning_shad.uniforms[1], 0);
            this.mesh.vbosTex[0].bind(skinning_shad.uniforms[2], 0);
            this.mesh.vbosTex[1].bind(skinning_shad.uniforms[3], 1);
            this.mesh.vbosTex[2].bind(skinning_shad.uniforms[4], 2);
            this.datTex.bind(skinning_shad.uniforms[5], 3);
            this.arma.matTex.bind(skinning_shad.uniforms[6], 4);
            gl.bindVertexArray(empty_vao);
            skinning_shad.exec(this.mesh.vcnt);
            skinning_shad.unbind(3);
        }
    };
}