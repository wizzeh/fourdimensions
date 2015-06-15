var SETTING_VERTEXHELPER = true;
var DISABLE_VERTEXHELPER = true;

var DISABLE_FACES = false;

var rot_XW = 0;
var rot_YW = 0;
var rot_ZW = 0;

var reset_rotation = false;

var do_rot_XW = 0;
var do_rot_YW = 0;
var do_rot_ZW = 0;

var a4_v4_projectionvectors4 = [];

function matrix4multvector4(matrix,vector)
{
	var ret = [];
	var el = matrix.elements;
	ret[0] = el[0]*vector[0]+el[1]*vector[1]+el[2]*vector[2]+el[3]*vector[3];
	ret[1] = el[4]*vector[0]+el[5]*vector[1]+el[6]*vector[2]+el[7]*vector[3];
	ret[2] = el[8]*vector[0]+el[9]*vector[1]+el[10]*vector[2]+el[11]*vector[3];
	ret[3] = el[12]*vector[0]+el[13]*vector[1]+el[14]*vector[2]+el[15]*vector[3];
	return ret;
}

function rotatevertex4(vertex)
{
	//calculate XW rotation
	var xw = new THREE.Matrix4();
	xw.set(		Math.cos(rot_XW), 0,	0, Math.sin(rot_XW),
				0, 1, 0, 0,
				0, 0, 1, 0,
				-1*Math.sin(rot_XW), 0, 0, Math.cos(rot_XW));
	vertex = matrix4multvector4(xw,vertex);

	//calculate YW rotation
	var yw = new THREE.Matrix4();
	// yw.set(		1, 0, 0, 0,
	// 			0, Math.cos(rot_YW), 0, -1*Math.sin(rot_YW),
	// 			0, 0, 1, 0,
	// 			0, Math.sin(rot_YW), 0, Math.cos(rot_YW)
	// 	);
	// yw.set(		1, 0, 0, 0,
	// 			0, Math.cos(rot_YW), Math.sin(rot_YW), 0,
	// 			0, -1*Math.sin(rot_YW), Math.cos(rot_YW), 0,
	// 			0, 0, 0, 1
	// 	);
	yw.set(		Math.cos(rot_YW), Math.sin(rot_YW), 0, 0,
				-1*Math.sin(rot_YW), Math.cos(rot_YW), 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
		);

	vertex = matrix4multvector4(yw,vertex);

	//calculate ZW rotation
	var zw = new THREE.Matrix4();
	// zw.set(		1, 0, 0, 0,
	// 			0, 1, 0, 0,
	// 			0, 0, Math.cos(rot_ZW), -1*Math.sin(rot_ZW),
	// 			0, 0, Math.sin(rot_ZW), Math.cos(rot_ZW)	
	// 	);

	zw.set(		Math.cos(rot_ZW), 0, -1*Math.sin(rot_ZW), 0,
				0, 1, 0, 0,
				Math.sin(rot_ZW), 0, Math.cos(rot_ZW), 0,
				0, 0, 0, 1		
		);

	vertex = matrix4multvector4(zw,vertex);
	return vertex;
}


function cross4(U,V,W)
{
	var A = (V[0] * W[1]) - (V[1] * W[0]);
	var B = (V[0] * W[2]) - (V[2] * W[0]);
	var C = (V[0] * W[3]) - (V[3] * W[0]);
	var D = (V[1] * W[2]) - (V[2] * W[1]);
	var E = (V[1] * W[3]) - (V[3] * W[1]);
	var F = (V[2] * W[3]) - (V[3] * W[2]);

	var r1 = (U[1] * F) - (U[2] * E) + (U[3] * D);
	var r2 = -1 * (U[0] * F) + (U[2] * C) - (U[3] * B);
	var r3 = (U[0] * E) - (U[1] * C) + (U[3] * A);
	var r4 = -1 * (U[0] * D) + (U[1] * B) - (U[2] * A);

	var result = [r1,r2,r3,r4];
	return result;
}

function projectionvectors4(lookat, campos) {
	var v4_lookat = new THREE.Vector4(lookat[0],lookat[1],lookat[2],lookat[3]);
	var v4_camera = new THREE.Vector4(campos[0],campos[1],campos[2],campos[3]);

	var v4_D = new THREE.Vector4();
	v4_D.subVectors(v4_lookat,v4_camera);
	v4_D.divideScalar(v4_D.length());

	var a4_A = cross4([0,1,0,0],[0,0,1,0],[v4_D.x,v4_D.y,v4_D.z,v4_D.w]);
	var v4_A = new THREE.Vector4(a4_A[0],a4_A[1],a4_A[2],a4_A[3]);
	v4_A.divideScalar(v4_A.length());

	var a4_B = cross4([0,0,1,0],[v4_D.x,v4_D.y,v4_D.z,v4_D.w],[v4_A.x,v4_A.y,v4_A.z,v4_A.w]);
	var v4_B = new THREE.Vector4(a4_B[0],a4_B[1],a4_B[2],a4_B[3]);
	v4_B.divideScalar(v4_B.length());

	var a4_C = cross4([v4_D.x,v4_D.y,v4_D.z,v4_D.w],[v4_A.x,v4_A.y,v4_A.z,v4_A.w],[v4_B.x,v4_B.y,v4_B.z,v4_B.w]);
	var v4_C = new THREE.Vector4(a4_C[0],a4_C[1],a4_C[2],a4_C[3]);

	return [v4_A,v4_B,v4_C,v4_D];

	// var m4_transformer = new THREE.Matrix4(	v4_A.x,v4_B.x,v4_C.x,v4_D.x,
	// 										v4_A.y,v4_B.y,v4_C.y,v4_D.y,
	// 										v4_A.z,v4_B.z,v4_C.z,v4_D.z,
	// 										v4_A.z,v4_B.z,v4_C.z,v4_D.z);
	// //eye coordinates of vertex
	
}

function projectvertex4(vertex, camera, A, B, C, D)
{
	var v4_vertex = new THREE.Vector4(vertex[0],vertex[1],vertex[2],vertex[3]);
	var v4_camera = new THREE.Vector4(camera[0],camera[1],camera[2],camera[3]);

	var v4_working = new THREE.Vector4();

	var T = 1/Math.tan(.5*(1/4)*Math.PI); //4d viewing angle
	//5/6

	v4_working.subVectors(v4_vertex,v4_camera);

	var S = T / v4_working.dot(D);

	var v3_final = new THREE.Vector3();
	v3_final.set( S*v4_working.dot(A), S*v4_working.dot(B), S*v4_working.dot(C) );

	return v3_final;
}

	var scene = new THREE.Scene();
	var camera;

	var renderer = new THREE.WebGLRenderer( { alpha:true } );
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshLambertMaterial( { color: 0xD82032, transparent:true, opacity:0.5, side: THREE.FrontSide, morphTargets:false } );
	//double side also possible

	var cube = new THREE.Mesh( geometry, material );
	var cube2 = new THREE.Mesh( geometry, material );
	var edges = new THREE.EdgesHelper(cube,0x080705);

	var controls; 

	var vertices = [ [-1,-1,-1,-1], [-1,-1,-1,1], [-1,-1,1,-1], [-1,1,-1,-1], [1,-1,-1,-1], 
		[-1,-1,1,1], [-1,1,-1,1], [1,-1,-1,1], [-1,1,1,-1], [1,-1,1,-1], [1,1,-1,-1],
		[-1,1,1,1], [1,-1,1,1], [1,1,-1,1], [1,1,1,-1], [1,1,1,1] ];

	var faces = [ 
			[2,9,4,0], [5,12,9,2] /*o*/, [0,2,5,1], [4,0,1,7], [9,4,7,12],
			[1,7,12,5] /*o*/, [8,14,9,2] /*o2*/, [3,8,2,0] /*o*/, [0,4,10,3], [14,10,4,9] /*o*/, 
			[3,10,14,8] /*o*/, [11,15,12,5] /*o*/, [1,5,11,6], [7,1,6,13], [12,7,13,15],
			[11,15,13,6], [8,11,5,2] /*o*/, [0,1,6,3], [3,8,11,6], [10,3,6,13],
			[4,7,13,10], [10,14,15,13], [9,12,15,14], [8,14,15,11]
	];

	var rooms = [
		[0,6,7,8,9,10], [-11,5,14,13,12,15], [1,22,23,16,-6,11], [-20,19,17,-3,-8,-13], [-100,-1,2,3,4,-5], 
		[-10,-15,-18,-23,21,-19], [9,14,22,4,-20,21], [-7,-12,-2,-16,18,-17]
	];

	var updatedvertices = [];
	var vertexhelper = [];

function updatevertexlist()
{
	updatedvertices = [];
	var tempvert;
	for(var l=0;l<vertices.length;l++)
	{
		tempvert = rotatevertex4(vertices[l]);
		tempvert = projectvertex4(tempvert,[4,0,0,0],a4_v4_projectionvectors4[0],a4_v4_projectionvectors4[1],a4_v4_projectionvectors4[2],a4_v4_projectionvectors4[3]); //camera.position.x,camera.position.y,camera.position.z
		
		updatedvertices.push(tempvert);

		if(SETTING_VERTEXHELPER == true)
		{
			if(vertexhelper.length <= l)
			{
				var helper = new THREE.TextGeometry(l+"",{size:.2,height:.1});
				vertexhelper[l] = new THREE.Mesh(helper,new THREE.MeshBasicMaterial({color:0x080705}));
				scene.add(vertexhelper[l]);
			}

			vertexhelper[l].position.x = tempvert.x;
			vertexhelper[l].position.y = tempvert.y;
			vertexhelper[l].position.z = tempvert.z
			
		}
	}
}

var vertextracker = false;
var facetracker = false;

function render() 
{
	if(vertextracker != DISABLE_VERTEXHELPER && SETTING_VERTEXHELPER)
	{
		for(var j=0; j<vertices.length;j++)
		{
			if(DISABLE_VERTEXHELPER == false)
			{
				scene.add(vertexhelper[j]);
			}
			else {
				scene.remove(vertexhelper[j]);
			}
		}
		vertextracker = DISABLE_VERTEXHELPER;
	}

	if(!DISABLE_VERTEXHELPER && SETTING_VERTEXHELPER)
	{
		var displacement = new THREE.Vector3();
		for(var m=0; m<vertices.length;m++)
		{
			// displacement.subVectors(vertexhelper[m].position,camera.position);
			// if(displacement.length()<.001)
			// {
			// 	continue;
			// }

			// var facing = new THREE.Vector3

			vertexhelper[m].lookAt(camera.position);
		}
	}

	if(facetracker != DISABLE_FACES)
	{
		for(var k=0; k<rooms.length;k++)
		{
			if(DISABLE_FACES == false)
			{
				scene.add(fourmesh[k]);
			}
			else {
				scene.remove(fourmesh[k]);
			}
		}
		facetracker = DISABLE_FACES;
	}

	requestAnimationFrame( render );
	rot_XW += do_rot_XW * 0.005;
	rot_YW += do_rot_YW * 0.005;
	rot_ZW += do_rot_ZW * 0.005;

	if(reset_rotation==true)
	{
		console.log("reset");
		reset_rotation=false;
		rot_XW = 0;
		rot_YW = 0;
		rot_ZW = 0;
		camera.position.x=3;
		camera.position.y=3;
		camera.position.z=3;
		camera.lookAt( new THREE.Vector3( 0,0,0) );
	}

	updatevertexlist();
	for(var i=0;i<rooms.length;i++)
	{
		fourmesh[i].geometry.vertices = updatedvertices;
		fourmesh[i].geometry.verticesNeedUpdate = true;
		scene.remove(fouredges[i]);
		fouredges[i].geometry.dispose();
		fouredges[i].material.dispose();
		fouredges[i] = new THREE.EdgesHelper( fourmesh[i] ,0x080705);
		fouredges[i].material.linewidth=2;
		fouredges[i].name="fouredges"+i;
		scene.add(fouredges[i]);
	}


	renderer.render( scene, camera );


	// cube.rotation.x += 0.01;
	// cube2.rotation.x += 0.01;
}

// function animate()
// {
	//	controls.update();
// 	
// }


	var light = new THREE.AmbientLight( 0x404040 );
	var dirlight = new THREE.DirectionalLight( 0xffffff, .1 );
	
	dirlight.position.set( 0,5,0 );

	var fourgeometry=[];
	var fourmesh = [];
	var fouredges = [];

$(function() {
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x000000, 0 );
	$("#pagetitle").after( renderer.domElement );
	camera = new THREE.PerspectiveCamera( 75, $(".textbox").width()/($(".textbox").width()/2), 0.1, 1000 );
	renderer.setSize( $(".textbox").width(), $(".textbox").width()/2 );



	camera.position.z = 3;
	camera.position.y = 3;
	camera.position.x = 3;
	camera.lookAt( new THREE.Vector3( 0,0,0 ) );

	controls = new THREE.OrbitControls( camera );
				controls.damping = 0.2;
				//controls.addEventListener( 'change', render );

	a4_v4_projectionvectors4 = projectionvectors4([0,0,0,0],[4,0,0,0])


	updatevertexlist();

	

	var renderedfaces = [];
	//rooms.length
	//0,1
	for(var i=0;i<rooms.length;i++)
	{
		fourgeometry[i] = new THREE.Geometry();
		fourgeometry[i].vertices = updatedvertices;
		for(var j=0;j<rooms[i].length;j++)
		{
			var faceid = Math.abs(rooms[i][j]);
			if(faceid == 100)
			{
				faceid = 0;
			}

			var faceverts = faces[faceid];

			if(rooms[i][j]<0)
			{
				faceverts.reverse();
			}
			if($.inArray(faceid,renderedfaces) > -1)
			{
				//continue;
			}
			renderedfaces.push(faceid);
			fourgeometry[i].faces.push( new THREE.Face3( 	
														faceverts[0],
														faceverts[1],
														faceverts[2]
													)
									);
			fourgeometry[i].faces.push( new THREE.Face3( faceverts[0],faceverts[2],faceverts[3] ) );
		}
		
		fourgeometry[i].computeBoundingSphere();
		fourgeometry[i].computeFaceNormals();
		fourgeometry[i].computeVertexNormals();
		fourgeometry[i].computeMorphNormals();
		fourmesh[i] = new THREE.Mesh( fourgeometry[i], material );
		fouredges[i] = new THREE.EdgesHelper( fourmesh[i] ,0x080705);
		fouredges[i].material.linewidth=2;
		fouredges[i].name="fouredges"+i;
		scene.add(fourmesh[i]);
		scene.add(fouredges[i]);
	}

	// scene.add( cube );
	// scene.add( cube2 );
	// scene.add( edges );

	scene.add( light );
	scene.add( dirlight );

	
	
	render();

	$( "#vertextoggle" ).click(function(event) {
		event.preventDefault();
		DISABLE_VERTEXHELPER = !DISABLE_VERTEXHELPER;
	});

	$( "#facetoggle" ).click(function(event) {
		event.preventDefault();
		DISABLE_FACES = !DISABLE_FACES;
	});

	$( window ).resize(function(event) {
		camera.aspect = $(".textbox").width()/($(".textbox").width()/2);
		renderer.setSize( $(".textbox").width(), $(".textbox").width()/2 );
	});
});

