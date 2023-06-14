AutodeskNamespace("Autodesk.ADN.Viewing.Extension");
Autodesk.ADN.Viewing.Extension.Color = function(viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var overlayName = "temperary-colored-overlay";
    var _self = this;
    var defMaterials = {}
    var materials = {}

    _self.load = function() {

        console.log('Autodesk.ADN.Viewing.Extension.Color loaded');
        
        function addMaterial(color, name) {
            if (name in materials){
                return materials[name]
            } else {
                console.log('Creating Material for ', name)
                const material = new THREE.Vector4(color[0], color[1], color[2], color[3]);
                materials[name] = material
                return material;
            }

        }

        Autodesk.Viewing.Viewer3D.prototype.setColorMaterial = function(objectIds, color, name) {
            var material = addMaterial(color, name);
            const frags = viewer.model.getFragmentList();
            //from dbid to node, to fragid
            var it = viewer.model.getData().instanceTree;
            for (var i=0; i<objectIds.length; i++) {
                var dbid = objectIds[i];
                viewer.setThemingColor(dbid, material, null, true);
            }
            viewer.impl.invalidate(true);
        }

        Autodesk.Viewing.Viewer3D.prototype.restoreColorMaterial = function(objectIds) {
            viewer.clearThemingColors();
            viewer.impl.invalidate(true);
        }

        _self.unload = function() {
            console.log('Autodesk.ADN.Viewing.Extension.Color unloaded');
            return true;
        };
    };
};
Autodesk.ADN.Viewing.Extension.Color.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
Autodesk.ADN.Viewing.Extension.Color.prototype.constructor = Autodesk.ADN.Viewing.Extension.Color;
Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.ADN.Viewing.Extension.Color', Autodesk.ADN.Viewing.Extension.Color);