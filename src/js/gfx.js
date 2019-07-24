var start_time = Date.now();

var time = (Date.now() - start_time) * 0.001;

var GFX = {
    scene: null,
    context: null,
    camera: null,
    renderer: null,
    lines_mesh: null,
    cube: null,

    init_time_clicked: 0,

    initCanvas: function() {

        this.scene = new RD.Scene();
        this.context = GL.create({
            width: window.innerWidth*0.6,
            height: window.innerHeight,
            alpha: true,
            premultipliedAlpha: false
        });
        this.context.onmouse = this.onmouse.bind(this);
		this.context.canvas.id = "main_canvas";
        this.camera = new RD.Camera();

        //pos, target, ?
        this.camera.lookAt([0, 1000, 2500], [0, 70, 0], [0, 1, 0]);
        this.camera.perspective(45, this.context.canvas.width / this.context.canvas.height, 100, 2000000);

		

		scenario = new RD.SceneNode();
		scenario.mesh = "square.WBIN";
		scenario.name = "scenario";
		scenario.shader = "phong_shadow";
		scenario.color = [1.0,1.0,1.0,1.0];
		scenario.position = [0,0,0];
		this.scene.root.addChild(scenario);

        floor = new RD.SceneNode();
        floor.name = "floor";
        floor.mesh = "planeXZ"
        floor.texture = "floor6.jpg";
        floor.shader = "phong_texture_shadow";
        floor.position = [0, -5, 0];
        floor.scaling = 100000;
        floor.uniforms.u_tiling = vec2.fromValues(600, 600);
        this.scene.root.addChild(floor);

        this.renderer = new RD.Renderer(this.context, {
            assets_folder: "assets/",
            shaders_file: "shaders.txt",
            // autoload_assets: true //default

        });

		var tex = Texture.cubemapFromURL("assets/cubemap3.png", {is_cross: true});
		gl.textures["skyboxTex"] = tex;

		
		skybox = new RD.SceneNode();

		skybox.mesh = "cube";
		skybox.name = "skybox";
		skybox.scaling = 100000;
		skybox.texture = "skyboxTex";
		skybox.position = [0, 100, 0];
		skybox.shader = "skybox";
		skybox.flags.depth_test = false;
		skybox.flags.flip_normals = true;
		skybox.render_priority = RD.PRIORITY_BACKGROUND;
		this.scene.root.addChild(skybox);
		

		gl.canvas.ondragover = () => {return false};
		gl.canvas.ondragend = () => {return false};
		gl.canvas.ondrop = function(e){
			
			e.preventDefault();
			e.stopPropagation();
			var file = e.dataTransfer.files[0];
			var reader = new FileReader();

			// Closure to capture the file information.
			reader.onload = function(e) {
//				debugger;
				var data = JSON.parse(e.target.result);
				CORE.GUI.openImportDialog(data, file);
//			    CORE.Scene.loadScene(data.scene);
//				node_editor.graph.configure(data.behavior);
//				animation_manager.loadAnimations(data.animations);
				
			}

			reader.readAsText(file);
		  // 
		}

        // declare uniforms
		this.background_color = vec3.fromValues(0.7, 0.7, 0.7);
        this.renderer._uniforms['u_ambient_light'] = vec3.fromValues(0.5, 0.5, 0.5),
        this.renderer._uniforms['u_light_position'] = vec3.fromValues(10, 3000, 100);
        this.renderer._uniforms['u_light_color'] = vec3.fromValues(0.9, 0.9, 0.9);
        this.renderer._uniforms['u_specular'] = 0.1;
        this.renderer._uniforms['u_glossiness'] = 20;
        this.renderer._uniforms['u_fresnel'] = 0.1;
		this.renderer._uniforms['u_background_color'] = this.background_color;

        // gl.lineWidth(5);

        //

        

        this.renderer.context.captureMouse(true);
        this.renderer.context.captureKeys(true);

        CORE.Player.panel.content.appendChild(this.renderer.canvas);

        // grid = new RD.SceneNode();
        // grid.mesh = "grid";
        // grid.scaling = 300;
        // grid.color = [0.2,0.2,0.2,0.7];
        // grid.primitive = gl.LINES;   
        // this.scene.root.addChild(grid);
        // GFX.createEnviroment();

        var bg_color = vec4.fromValues(54 / 255, 75 / 255, 78 / 255, 0);
        var last = now = getTime();

        requestAnimationFrame(animate);

        function animate() {
            requestAnimationFrame(animate);

            last = now;
            now = getTime();
            var dt = (now - last) * 0.001;
            global_dt = dt;
            time = (Date.now() - start_time) * 0.001;

            // if(GFX.context2.start2D)
            //   GFX.context2.start2D();
			if(RENDER_FPS)
				stats.begin();
		
			// skybox.position = GFX.camera.position;

            GFX.renderer.clear([0, 0, 0, 0.1]);
            GFX.renderer.render(GFX.scene, GFX.camera);
            CORE.Labels.update();
            
            GFX.scene.update(dt);
            update(dt);
			
			if(RENDER_FPS)
				stats.end();
	
            //GFX.draw_analysis(GFX.canvas2D, GFX.context2, dt);

        }
        this.renderer.setPointSize(4);
        this.renderer.context.captureKeys(true);
        this.renderer.context.captureMouse(true);
        this.renderer.context.onmousemove = function(e) {
            GFX.onmouse(e);
        }
        this.renderer.context.onmousedown = function(e) {
            
        }
        this.renderer.context.onkeydown = function(e) {
        
            if(e.shiftKey){
                
                if(e.keyCode == 37) {

                    if(window.tmp_graph_container)
                    return;

                    window.tmp_graph_container = CORE.GraphManager.graphcanvas.canvas.parentNode;
                    $("#full").append( CORE.GraphManager.graphcanvas.canvas).show();
                    node_editor.graph_canvas.resize();
                }

                if(e.keyCode == 39) {

                    if(!window.tmp_graph_container)
                    return;

                    $(window.tmp_graph_container).append( CORE.GraphManager.graphcanvas.canvas);
                    $("#full").hide();
                    window.tmp_graph_container = null;
                    node_editor.graph_canvas.resize();
                }
               
            }
        }

        this.renderer.context.onkeyup = function(e) {

            if(e.keyCode == 46){
                for(var i in node_editor.graph_canvas.selected_nodes)
                {
                    var node = node_editor.graph_canvas.selected_nodes[i];
                    node_editor.graph.remove(node);
                }
            }
            if(e.keyCode == 46){
				if(agent_selected)
	               AgentManager.deleteAgent(agent_selected.uid);
            }

           
        }
            
    },

    onmouse: function(e) {
        if (e.type == "mousemove" && e.dragging) {
            if (e.leftButton) {
                GFX.camera.orbit(e.deltax * -0.005, [0, 1, 0]);
                GFX.camera.orbit(e.deltay * -0.005, [1, 0, 0], null, true);
            }
            if (e.rightButton) {
                var vect = vec3.fromValues(e.deltax * -0.5, e.deltay * 0.5, 0);
                GFX.camera.moveLocal(vect)
            }
        } 
        else if (e.type == "wheel") 
            GFX.camera.orbitDistanceFactor(1.0 - (e.wheel / 2000));
        
        else if (e.type == "mousedown") 
        {
            if (e.leftButton) {
                GFX.init_time_clicked = Date.now();
            }
            else
            {
                GFX.init_time_clicked = null;
                // var actions = [
                // {
                //     title: "Create ", //text to show
                //     has_submenu: true,
                //     submenu: {
                //         options: 
                //         [{
                //             title: "Interest Point",
                //             callback: function() 
                //             { 
                //                 var x = e.canvasx;
                //                 var y = e.canvasy;
                //                 var position = GFX.testCollision(x, y);
                //                 CORE.Scene.addInterestPoint(position[0], position[2]); 
                //             }
                //         }, 
                //         {
                //             title: "Agent",
                //             callback: function() 
                //             { 
                //                alert("Functionality on developement. Sorry!");
                //             }
                //         }
                //         ]
                //     }
                // }
                // ];
                // var contextmenu = new LiteGUI.ContextMenu( actions, { event: e });
            }    

        }
        else if ( e.type == "mouseup")
        {
            if(scene_mode == NAV_MODE)
            {
                if(!GFX.init_time_clicked) 
                    return;
    
                var dif = Date.now() - GFX.init_time_clicked;
                //check if the action is drag or a fast click
                if(dif < 200)
                {
                    var x = e.canvasx;
                    var y = e.canvasy;
                    //testRay with that spheres
                    var agent = GFX.getElementFromTestCollision(x, y, 1);
                    if (!agent) 
                    {
                        disselectCharacter();
                        agent_selected = null;
                        agent_selected_name = null;
                        CORE.GraphManager.renderStats();
                        //try with interest points
                        var ip_info = GFX.getElementFromTestCollision(x, y, 2);
                        if(ip_info)
                            // console.log("meh");
                            CORE.Scene.showInterestPointInfo(ip_info, x, y);
                        return;
                    }
    
                    disselectCharacter();
                    for (var i in AgentManager.agents) 
                        AgentManager.agents[i].changeColor();
                    
                    agent.is_selected = true;
                    agent_selected_name = agent.properties.name;
                    agent_selected = agent;
                    
                    agent.changeColor();
    
                    var agents = CORE.AgentManager.agents;
                    for (var i in agents) 
                    {
                        var ag = agents[i];
                        ag.dialog.close();
                    }
                    agent.dialog.show();
                    agent.dialog.setPosition(10,125);
                    CORE.GraphManager.renderStats();
                }
            }
            else if(scene_mode == IP_CREATION_MODE)
            {
                if(!GFX.init_time_clicked) 
                return;
                
                var dif = Date.now() - GFX.init_time_clicked;
                //check if the action is drag or a fast click    
                if(dif < 200)
                {
                    var x = e.canvasx;
                    var y = e.canvasy;
                    var position = GFX.testCollision(x, y);
                    CORE.Scene.addInterestPoint(position[0], position[2]);
                }
            }

			else if(scene_mode == AGENT_CREATION_MODE)
			{
				if(!GFX.init_time_clicked) 
                return;
                
                var dif = Date.now() - GFX.init_time_clicked;
                //check if the action is drag or a fast click    
                if(dif < 200)
                {
                    var x = e.canvasx;
                    var y = e.canvasy;
                    var position = GFX.testCollision(x, y);
					if(!position)
						return;
					position[1] = 0;
                    var agent = new Agent(null, position);
                }
			}
        }
    },

    updateCamera: function(skeleton) {
        var pos = skeleton.getGlobalPosition();
		pos[1] += 50;
		
		var last = GFX.camera.target;  

		vec3.lerp(pos, pos, last, 0.9);
		GFX.camera.target = pos;

//        var direction = GFX.rotateVector(skeleton.getGlobalMatrix(), [0, 0, 1]);
//        direction = vec3.multiply(direction, direction, [300, 200, -300]);
//
//        var eye = vec3.create();
//        vec3.add(eye, pos, direction);
//        vec3.add(eye, eye, [0, 100, 0]);
//
//        var final_cam_pos = vec3.fromValues(pos[0] - 300, 200, pos[2] + 300);
//        var final_cam_target = vec3.fromValues(pos[0], 120, pos[2]);
//
//        vec3.lerp(final_cam_pos, GFX.camera.position, final_cam_pos, 0.2);
//        vec3.lerp(final_cam_target, GFX.camera.target, final_cam_target, 0.2);
//
//
//        GFX.camera.lookAt(
//            final_cam_pos, final_cam_target, [0, 1, 0]);
    },

    createEnviroment: function() {
        var cube = new RD.SceneNode();
        cube.mesh = "cube";
        cube.shader = "phong";
        cube.color = [1, 1, 1, 1];
        cube.scale([50, 500, 50]);
        cube.position = [700, 500 / 2, -500];
        GFX.scene.root.addChild(cube);
    },

    rotateVector: function(matrix, v) {
        var mat = mat4.clone(matrix);
        mat[12] = 0.0;
        mat[13] = 0.0;
        mat[14] = 0.0;

        var result = vec3.create();
        result = mat4.multiplyVec3(result, mat, v);
        vec3.normalize(result, result);
        return result;
    },

    orientCharacter: function(sk_container) {
        console.log(head);
        var vect = vec3.create();
        vect = vec3.subtract(vect, head.getGlobalPosition(), target);
        vect = vec3.normalize(vect, vect);

        var front = GFX.rotateVector(head._global_matrix, RD.BACK)

        var dot = vec3.dot(front, vect)
        var degree = 1 - dot;

        var axis = vec3.create();
        axis = vec3.cross(axis, vect, front);
        var inverse_mat = mat4.create();
        inverse_mat = mat4.invert(inverse_mat, head._global_matrix);
        axis = GFX.rotateVector(inverse_mat, axis);

        //rotate de gl-matrix es el rotateLocal
        var result_mat = mat4.create();
        result_mat = mat4.rotate(result_mat, head._global_matrix, degree, axis)

        head.fromMatrix(result_mat);
    },

    testCollision: function(x, y) {
        var result = vec3.create();
        var ray = GFX.camera.getRay(x, y);
        var node = GFX.scene.testRay(ray, result, undefined, 0x1, true);
        if (node) 
            return result;
    },

    getElementFromTestCollision: function(x, y, type) {
        var result = vec3.create();
        var ray = GFX.camera.getRay(x, y);
        return GFX.testRayWithSpheres(ray, 70, type);
    },

    testRayWithSpheres: function(ray, radius, type) {

        if(type == 1)
        {
            var agents = CORE.AgentManager.agents;
            // console.log(agents);
            for (var i in agents) {
                var agent = agents[i];
                var center = agent.skeleton.skeleton_container.getGlobalPosition();
                center[1] = 100;
                var collision = ray.testSphere(center, radius, 10000);
                // console.log(collision);
    
                if (collision) {
                    // console.log(agent);
                    return agent;
                }
            }
        }
        else if(type == 2)
        {
            var interest_points = CORE.Scene.properties.interest_points;

            for(var i in interest_points)
            {   
                var type_ = i;
                var type_list = interest_points[i];
                for(var j in type_list)
                {
                    var ip = type_list[j];
                    var position = ip.pos;
                    var collision = ray.testSphere(position, 40, 10000);
                    if(collision)
                        return {ip:ip,ip_type:type_};
                    
                }
            }
        }
    }
}
