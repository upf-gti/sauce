//18/09/2018

class GUI{
    constructor(){
       
        LiteGUI.init();
        var main_area = this.root = new LiteGUI.Area({id:"main-area"});
        LiteGUI.add(main_area);

        main_area.split("vertical",["0px", null] );

        var menu = this.menu = new LiteGUI.Menubar("menu");
        this.menu.panel = main_area.getSection(0);
        this.menu.panel.content.parentElement.id = "menu-panel";
        this.node_info_dlg = null;
        this.node_info_insp= null;
        main_area.getSection(0).add(menu);


        this.root = main_area.getSection(1);
    }

    postInit(){
        this.toggleGUI( true );
    }

    /**
     * Toggle between displaying or hidding the content.
     * @param {boolean} v - true : display, false : hide
     */
    toggleGUI ( v ){
        document.body.style.opacity = (!!v)? 1.0 : 0.0;
    }


    showNodeInfo( node )
    {
        if(!this.node_info_dlg){
            var node_info_dlg = this.node_info_dlg = new LiteGUI.Dialog( { id:"Node_info", title:'Node info', close: true, minimize: false, width: 300, height: 500, scroll: false, resizable: false, draggable: true, parent:"body"});
            this.node_info_dlg.setPosition(window.width,window.height);

        }
        var dlg = this.node_info_dlg;

        if(!this.node_info_insp){
            var node_info_insp = this.node_info_insp = new LiteGUI.Inspector(),
                node_info_dlg = this.node_info_dlg;

            node_info_insp.on_refresh = function()
            {
                node_info_insp.clear();
                node_info_insp.addTitle(node.title); 
                node_info_insp.addNumber("Threshold", node.data.limit_value, {callback: function(v)
                {
                    node.data.limit_value = v;
                }}); 
                node_info_insp.addSeparator();
                // for(let i in CORE.Scene.behaviors)
                // {
                //     let behavior = CORE.Scene.behaviors[i];
                //     node_info_insp.addButton(i,"Load",{callback:function(){
                //         // console.log("Loading: ", JSON.parse(behavior));
                //         debugger;
                //         behavior = JSON.parse(behavior);
                //         node_editor.graph.configure(behavior);
                //         dlg.close();
                //     }})
                // }
                dlg.adjustSize();
            }

            this.node_info_dlg.add(node_info_insp);
            node_info_insp.refresh();
        }

        this.node_info_dlg.show('fade');
        this.node_info_dlg.setPosition(100,270);
    }
}

CORE.registerModule( GUI );