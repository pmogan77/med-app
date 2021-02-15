//importing the code utilized
//THREE imports in the library, includes scenes, camera, and renderer
import * as THREE from "../build/three.module.js";

//GLTFLoader imports in a loader that processes the 3d model to be implemented into the program
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";
//OrbitControls imports in controls so user can move around the scene
import { OrbitControls } from "./jsm/controls/OrbitControls.js";
//Transform Controls imports in a seperate control that will help with collisions
import { TransformControls } from "./jsm/controls/TransformControls.js";
//ThreeBSP provides the ability to see where objects are intersecting

//declare variables for the 3d components
let scene, renderer, camera, stats, controls;
let model, skeleton, mixer, clock;

//declare variables for collision detection
let pastPosX, pastPosY, pastPosZ;
var geometry1, geometry2, limbMaterial, material, group, intControl;
var head,
	upperBack,
	lowerBack,
	neck,
	shoulder,
	upperleftArm,
	rightElbow,
	leftElbow,
	upperrightArm,
	lowerleftArm,
	lowerrightArm,
	chest,
	stomach,
	groin,
	buttox,
	leftThigh,
	rightThigh,
	leftLowerLeg,
	rightLowerLeg,
	leftKnee,
	rightKnee,
	leftHand,
	rightHand,
	leftFoot,
	rightFoot;

//collision boxes
let limbElement = document.getElementById("limbSelector");

var firstSubmit = true;

//adding user forms for symptoms
//get modal elements
var modal = document.getElementById("simpleModal");
//getting DOM elements for symptom forms
var skinForm = document.getElementById("Skin");
var OthersForm = document.getElementById("Others");
var PsychologicalForm = document.getElementById("Psychological");
var movementSpeechImpairmentForm = document.getElementById(
	"movement/ speech impairment"
);
var PersonalInfromationForm = document.getElementById("Personal Infromation");
var StomachForm = document.getElementById("Stomach");
var ButtoxForm = document.getElementById("Buttox");
var GroinForm = document.getElementById("Groin");
var NeckForm = document.getElementById("Neck");
var ChestForm = document.getElementById("Chest");
var HeadForm = document.getElementById("Head");
var EyesForm = document.getElementById("Eyes");
var RespritoryForm = document.getElementById("Respritory");
var MuscularForm = document.getElementById("Muscular");
var SkeletalForm = document.getElementById("Skeletal");
var kneeForm = document.getElementById("knee");
var footForm = document.getElementById("foot");
var handsForm = document.getElementById("hands");
var legsForm = document.getElementById("legs");
var backForm = document.getElementById("back");

var click = false;
var arrayOfForms;
var targetInput;
var customSymptomList = [];

//displaying the selected symptoms
var table = document.getElementById("tableBody");

//temporary console display
let webConsole = document.getElementById("console");

/* Register click event with the container element */

init();

function init() {
	disableInput();
	const container = document.getElementById("container");

	//initialize form

	displayDefault();
	limbElement.innerHTML = "None Selected";

	//Camera
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set(1, 3, 7);
	camera.lookAt(0, 2, 0);

	//initialize clock and scene
	clock = new THREE.Clock();
	scene = new THREE.Scene();

	//scene background can be changed to white, #4cacd4, and black by changing color
	let color = "white";
	//#4cacd4 background
	if (color == "#4cacd4") {
		scene.background = new THREE.Color("rgb(174, 214, 241)");
	} else if (color == "black") {
		scene.background = new THREE.Color("rgb(0, 0, 0)");
	} else {
		scene.background = new THREE.Color("rgb(247, 239, 238)");
	}

	//adding fog to the scene
	scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

	//initializing and adding lighting to the scene
	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
	hemiLight.position.set(0, 20, 0);
	scene.add(hemiLight);
	const dirLight = new THREE.DirectionalLight(0xffffff);
	dirLight.position.set(8, 15, 6);
	dirLight.castShadow = true;
	dirLight.shadow.camera.top = 2;
	dirLight.shadow.camera.bottom = 2;
	dirLight.shadow.camera.left = 2;
	dirLight.shadow.camera.right = 2;
	dirLight.shadow.camera.near = 0.1;
	dirLight.shadow.camera.far = 40;
	scene.add(dirLight);

	//loading the 3d human model into the website
	const loader = new GLTFLoader();
	loader.load("models/scene.gltf", function (gltf) {
		var humanModel = gltf.scene.children[0];
		humanModel.scale.set(0.01, 0.01, 0.01);

		//add model to scene
		scene.add(gltf.scene);

		//adding shadows to the model
		humanModel.traverse(function (object) {
			if (object.isMesh) object.castShadow = true;
		});

		//creates animation loop to render the model
		animateHuman();
	});

	//creating test collision boxes
	geometry1 = new THREE.BoxGeometry(0.2, 0.2, 0.2);
	geometry2 = new THREE.BoxGeometry(0.2, 0.2, 0.2);

	//setting size of each limb's collisions
	head = new THREE.BoxGeometry(0.21, 0.31, 0.253);
	upperBack = new THREE.BoxGeometry(0.4, 0.2, 0.25);
	lowerBack = new THREE.BoxGeometry(0.4, 0.4, 0.2);
	neck = new THREE.BoxGeometry(0.15, 0.3, 0.11);
	shoulder = new THREE.BoxGeometry(0.5, 0.2, 0.2);
	rightElbow = new THREE.BoxGeometry(0.12, 0.12, 0.23);
	leftElbow = new THREE.BoxGeometry(0.12, 0.12, 0.2);
	upperleftArm = new THREE.BoxGeometry(0.15, 0.4, 0.23);
	upperrightArm = new THREE.BoxGeometry(0.15, 0.4, 0.23);
	lowerleftArm = new THREE.BoxGeometry(0.15, 0.4, 0.15);
	lowerrightArm = new THREE.BoxGeometry(0.15, 0.4, 0.15);
	chest = new THREE.BoxGeometry(0.4, 0.2, 0.25);
	stomach = new THREE.BoxGeometry(0.4, 0.4, 0.2);
	groin = new THREE.BoxGeometry(0.3, 0.3, 0.3);
	buttox = new THREE.BoxGeometry(0.3, 0.3, 0.3);
	leftThigh = new THREE.BoxGeometry(0.2, 0.6, 0.27);
	rightThigh = new THREE.BoxGeometry(0.2, 0.6, 0.27);
	leftLowerLeg = new THREE.BoxGeometry(0.15, 0.4, 0.18);
	rightLowerLeg = new THREE.BoxGeometry(0.15, 0.4, 0.18);
	leftKnee = new THREE.BoxGeometry(0.2, 0.2, 0.2);
	rightKnee = new THREE.BoxGeometry(0.2, 0.2, 0.2);
	leftHand = new THREE.BoxGeometry(0.2, 0.21, 0.2);
	rightHand = new THREE.BoxGeometry(0.2, 0.21, 0.2);
	leftFoot = new THREE.BoxGeometry(0.2, 0.2, 0.5);
	rightFoot = new THREE.BoxGeometry(0.2, 0.2, 0.5);

	//make this invisible eventually
	const materialColor = new THREE.Color(0xff0000);
	limbMaterial = new THREE.MeshPhongMaterial({
		color: materialColor,
		specular: 0x009900,
		opacity: 0.3,
		transparent: true,
	});

	head.name = "head";
	upperBack.name = "upper back";
	lowerBack.name = "lower back";
	neck.name = "neck";
	shoulder.name = "shoulder";
	leftElbow.name = "left elbow";
	rightElbow.name = "right elbow";
	upperleftArm.name = "upper left arm";
	upperrightArm.name = "upper right arm";
	lowerleftArm.name = "lower left arm";
	lowerrightArm.name = "lower right arm";
	chest.name = "chest";
	stomach.name = "stomach";
	groin.name = "groin";
	buttox.name = "buttox";
	leftThigh.name = "left thigh";
	rightThigh.name = "right thigh";
	leftLowerLeg.name = "lower left leg";
	rightLowerLeg.name = "lower right leg";
	leftKnee.name = "left knee";
	rightKnee.name = "right knee";
	leftHand.name = "left hand";
	rightHand.name = "right hand";
	leftFoot.name = "left foot";
	rightFoot.name = "right foot";

	var meshhead = new THREE.Mesh(head, limbMaterial);
	var meshupperBack = new THREE.Mesh(upperBack, limbMaterial);
	var meshlowerBack = new THREE.Mesh(lowerBack, limbMaterial);
	var meshneck = new THREE.Mesh(neck, limbMaterial);
	var meshshoulder = new THREE.Mesh(shoulder, limbMaterial);
	var meshleftElbow = new THREE.Mesh(leftElbow, limbMaterial);
	var meshrigtElbow = new THREE.Mesh(rightElbow, limbMaterial);
	var meshupperleftArm = new THREE.Mesh(upperleftArm, limbMaterial);
	var meshupperrightArm = new THREE.Mesh(upperrightArm, limbMaterial);
	var meshlowerleftArm = new THREE.Mesh(lowerleftArm, limbMaterial);
	var meshlowerrightArm = new THREE.Mesh(lowerrightArm, limbMaterial);
	var meshchest = new THREE.Mesh(chest, limbMaterial);
	var meshstomach = new THREE.Mesh(stomach, limbMaterial);
	var meshgroin = new THREE.Mesh(groin, limbMaterial);
	var meshbuttox = new THREE.Mesh(buttox, limbMaterial);
	var meshleftThigh = new THREE.Mesh(leftThigh, limbMaterial);
	var meshrightThigh = new THREE.Mesh(rightThigh, limbMaterial);
	var meshleftKnee = new THREE.Mesh(leftKnee, limbMaterial);
	var meshrightKnee = new THREE.Mesh(rightKnee, limbMaterial);
	var meshleftLowerLeg = new THREE.Mesh(leftLowerLeg, limbMaterial);
	var meshrightLowerLeg = new THREE.Mesh(rightLowerLeg, limbMaterial);
	var meshleftHand = new THREE.Mesh(leftHand, limbMaterial);
	var meshrightHand = new THREE.Mesh(rightHand, limbMaterial);
	var meshleftFoot = new THREE.Mesh(leftFoot, limbMaterial);
	var meshrightFoot = new THREE.Mesh(rightFoot, limbMaterial);

	//setting position of each limb's collisions
	meshhead.position.set(0, 2, 0.23);
	meshupperBack.position.set(0, 1.6, 0.1);
	meshlowerBack.position.set(-0, 1.4, 0.11);
	meshneck.position.set(0, 1.8, 0.2);
	meshshoulder.position.set(0, 1.7, 0.18);
	meshleftElbow.position.set(0.4, 1.4, 0.18);
	meshrigtElbow.position.set(-0.4, 1.4, 0.18);
	meshupperleftArm.position.set(0.25, 1.65, 0.15);
	meshupperrightArm.position.set(-0.25, 1.65, 0.15);
	meshlowerleftArm.position.set(0.48, 1.2, 0.18);
	meshlowerrightArm.position.set(-0.48, 1.2, 0.18);
	meshchest.position.set(0, 1.6, 0.2);
	meshstomach.position.set(-0, 1.4, 0.21);
	meshgroin.position.set(0, 1.1, 0.2);
	meshbuttox.position.set(0, 1.1, 0.16);
	meshleftThigh.position.set(0.1, 0.9, 0.2);
	meshrightThigh.position.set(-0.1, 0.9, 0.2);
	meshleftKnee.position.set(0.2, 0.6, 0.2);
	meshrightKnee.position.set(-0.2, 0.6, 0.2);
	meshleftLowerLeg.position.set(0.17, 0.4, 0.16);
	meshrightLowerLeg.position.set(-0.17, 0.4, 0.16);
	meshleftHand.position.set(0.5, 1.08, 0.2);
	meshrightHand.position.set(-0.5, 1.08, 0.2);
	meshleftFoot.position.set(0.2, 0.1, 0.2);
	meshrightFoot.position.set(-0.2, 0.1, 0.2);

	// usage:
	rotateObject(meshupperleftArm, 0, 0, 35);
	rotateObject(meshupperrightArm, 0, 0, 325);
	rotateObject(meshlowerleftArm, 0, 0, 15);
	rotateObject(meshlowerrightArm, 0, 0, 345);
	rotateObject(meshleftThigh, 0, 0, 15);
	rotateObject(meshrightThigh, 0, 0, 345);

	//make all collsion boxes invisible
	meshhead.visible = false;
	meshupperBack.visible = false;
	meshlowerBack.visible = false;
	meshneck.visible = false;
	meshshoulder.visible = false;
	meshupperleftArm.visible = false;
	meshrigtElbow.visible = false;
	meshleftElbow.visible = false;
	meshupperrightArm.visible = false;
	meshlowerleftArm.visible = false;
	meshlowerrightArm.visible = false;
	meshchest.visible = false;
	meshstomach.visible = false;
	meshgroin.visible = false;
	meshleftThigh.visible = false;
	meshrightThigh.visible = false;
	meshleftLowerLeg.visible = false;
	meshrightLowerLeg.visible = false;
	meshrightKnee.visible = false;
	meshleftKnee.visible = false;
	meshleftHand.visible = false;
	meshrightHand.visible = false;
	meshleftFoot.visible = false;
	meshrightFoot.visible = false;
	meshbuttox.visible = false;

	group = new THREE.Group();

	group.add(
		meshhead,
		meshbuttox,
		meshupperBack,
		meshlowerBack,
		meshneck,
		meshshoulder,
		meshupperleftArm,
		meshrigtElbow,
		meshleftElbow,
		meshupperrightArm,
		meshlowerleftArm,
		meshlowerrightArm,
		meshchest,
		meshstomach,
		meshgroin,
		meshleftThigh,
		meshrightThigh,
		meshleftLowerLeg,
		meshrightLowerLeg,
		meshrightKnee,
		meshleftKnee,
		meshleftHand,
		meshrightHand,
		meshleftFoot,
		meshrightFoot
	);
	scene.add(group);

	//intiialize the renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	container.appendChild(renderer.domElement);

	//initialize the controls
	controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener("change", render);

	//disables the zooming of 3d model
	controls.enableZoom = false;

	//Interactions
	intControl = new TransformControls(camera, renderer.domElement);
	scene.add(intControl);
	intControl.addEventListener("change", render);

	window.addEventListener("resize", onWindowResize, false);
	//collision detection
	window.addEventListener("mousemove", onDocumentMouseMove, false);
	//click detection
	window.addEventListener("click", onDocumentMouseClick, false);
}

function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	//renderer.setSize helps determine the size of canvas without changing inner
	renderer.setSize(window.innerWidth, window.innerHeight);
}
function animateHuman() {
	//prevent the user from moving below the ground
	controls.addEventListener("change", groundCheck);

	//determines if the user is facing the fron or the back
	renderer.render(scene, camera);
	requestAnimationFrame(animateHuman);
}

function groundCheck() {
	var minMoveValue = 1.5;

	if (pastPosY != null && pastPosY > camera.position.y) {
		if (camera.position.y < minMoveValue) {
			//camera.position.x=pastPosX;
			//camera.position.y=pastPosY;
			//camera.position.z=pastPosZ;
		}
	}

	pastPosX = camera.position.x;
	pastPosY = camera.position.y;
	pastPosZ = camera.position.z;
}

let selectedObject = null;
var previousSymptom = null;
var previousObject = null;

function onDocumentMouseMove(event) {
	event.preventDefault();
	if (
		isChildOf(modal, event.target) &&
		event.target.getAttribute("for") == "symptom"
	) {
		if (previousSymptom != event.target) {
			event.target.style.background = "#E0E0E0";
			if (previousSymptom != null) {
				previousSymptom.style.background = "none";
			}
		}

		if (event.target != previousSymptom) {
			previousSymptom = event.target;
		}
	} else if (isChildOf(modal, event.target)) {
		//event.target.style.background = "none";
		if (previousSymptom != null) {
			previousSymptom.style.background = "none";
		}
	} else {
		if (previousSymptom != null) {
			previousSymptom.style.background = "none";
		}

		if (click == false) {
			if (selectedObject == null) {
				limbElement.innerHTML = "None Selected";
				displayDefault();
			}

			if (selectedObject) {
				limbElement.innerHTML = selectedObject.geometry.name;
				correctSymptoms(selectedObject.geometry.name);
				selectedObject.visible = false;

				selectedObject = null;
			}

			const intersects = getIntersects(event.layerX, event.layerY);

			if (intersects.length > 0) {
				const res = intersects.filter(function (res) {
					return res && res.object;
				})[0];

				if (res && res.object) {
					selectedObject = res.object;
					limbElement.innerHTML = selectedObject.geometry.name;
					correctSymptoms(selectedObject.geometry.name);
					selectedObject.visible = true;
				}
			}
		}
	}
}

var selectedClickObject = null;

function onDocumentMouseClick(event) {
	event.preventDefault();

	if (
		isChildOf(modal, event.target) &&
		event.target.getAttribute("for") == "symptom"
	) {
		if (event.target.style.color == "rgb(76, 172, 212)") {
			event.target.style.color = "#303030";
			event.target.style.background = "none";
			symptomToArray();
		} else {
			event.target.style.color = "#4cacd4";
			event.target.style.background = "#E0E0E0";
			event.target.style.border = "rgb(76, 172, 212)";
			symptomToArray();
		}
	} else if (event.target.id == "submitSymptom") {
		if (firstSubmit == true) {
			firstSubmit = false;
		} else {
			generateDiagnosis();
		}
	} else {
		if (selectedClickObject == null) {
			click = false;
		}

		if (selectedClickObject) {
			selectedClickObject = null;
		}

		const intersects = getIntersects(event.layerX, event.layerY);
		var changed = false;

		if (intersects.length > 0) {
			const res = intersects.filter(function (res) {
				return res && res.object;
			})[0];

			if (res && res.object) {
				selectedClickObject = res.object;
				click = true;

				if (previousObject == null || selectedClickObject != previousObject) {
					selectedClickObject.visible = true;
					changed = true;
				}
			}
		}

		if (previousObject != null && selectedClickObject != previousObject) {
			click = false;
			previousObject.visible = false;
			selectedClickObject.visible = false;
			previousObject = null;
			changed = false;
		}
		if (changed) {
			previousObject = selectedClickObject;
		}
	}
}

const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector3();

function getIntersects(x, y) {
	x = (x / window.innerWidth) * 2 - 1;
	y = -(y / window.innerHeight) * 2 + 1;

	mouseVector.set(x, y, 0.5);
	raycaster.setFromCamera(mouseVector, camera);

	return raycaster.intersectObject(group, true);
}

function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
	object.rotateX(THREE.Math.degToRad(degreeX));
	object.rotateY(THREE.Math.degToRad(degreeY));
	object.rotateZ(THREE.Math.degToRad(degreeZ));
}

function correctSymptoms(limbName) {
	//webConsole.innerHTML = (limbName.toString()=="head");
	displayDefault();
	turnOffDefault();
	if (limbName.toString() == "head") {
		EyesForm.style.display = "inline-block";
		HeadForm.style.display = "inline-block";
	} else if (limbName.toString().includes("hand")) {
		handsForm.style.display = "inline-block";
	} else if (
		limbName.toString().includes("leg") ||
		limbName.toString().includes("knee") ||
		limbName.toString().includes("thigh")
	) {
		legsForm.style.display = "inline-block";
		kneeForm.style.display = "inline-block";
	} else if (limbName.toString().includes("stomach")) {
		StomachForm.style.display = "inline-block";
	} else if (limbName.toString().includes("chest")) {
		RespritoryForm.style.display = "inline-block";
		ChestForm.style.display = "inline-block";
	} else if (limbName.toString().includes("back")) {
		backForm.style.display = "inline-block";
	} else if (limbName.toString().includes("buttox")) {
		ButtoxForm.style.display = "inline-block";
	} else if (limbName.toString().includes("groin")) {
		GroinForm.style.display = "inline-block";
	} else {
		SkeletalForm.style.display = "inline-block";
		MuscularForm.style.display = "inline-block";
		skinForm.style.display = "inline-block";
	}
}

function turnOffDefault() {
	//skinForm.style.display='inline-block';
	skinForm.style.display = "none";
	OthersForm.style.display = "none";
	PsychologicalForm.style.display = "none";
	movementSpeechImpairmentForm.style.display = "none";
	PersonalInfromationForm.style.display = "none";
}

function displayDefault() {
	skinForm.style.display = "none";
	OthersForm.style.display = "inline-block";
	PsychologicalForm.style.display = "inline-block";
	movementSpeechImpairmentForm.style.display = "inline-block";
	PersonalInfromationForm.style.display = "inline-block";

	//turn off visibility for
	HeadForm.style.display = "none";
	GroinForm.style.display = "none";
	footForm.style.display = "none";
	ButtoxForm.style.display = "none";
	EyesForm.style.display = "none";
	ChestForm.style.display = "none";
	handsForm.style.display = "none";
	kneeForm.style.display = "none";
	legsForm.style.display = "none";
	backForm.style.display = "none";
	RespritoryForm.style.display = "none";
	StomachForm.style.display = "none";
	MuscularForm.style.display = "none";
	NeckForm.style.display = "none";
	SkeletalForm.style.display = "none";
}

//return false if the parent is not a parent of the child
//return true if parent is a parent of the child
function isChildOf(parent, child) {
	let node = child.parentNode;

	// keep iterating unless null
	while (node != null) {
		if (node == parent) {
			return true;
		}
		node = node.parentNode;
	}
	return false;
}

//make an array of all the checked values
function symptomToArray() {
	arrayOfForms = Array.from(document.getElementsByTagName("label"));

	//clear current table
	table.innerHTML = "";
	arrayOfForms.forEach((input) => {
		if (input.style.color == "rgb(76, 172, 212)") {
			customSymptomList.push(input.innerHTML.toString().substring(1));
			//adds the value to a table
			var tr = document.createElement("TR");

			var td = document.createElement("TD");
			td.appendChild(document.createTextNode(input.innerHTML));
			tr.appendChild(td);

			td = document.createElement("TD");

			// // add a button control.
			// var button = document.createElement('input');

			// // set the attributes.
			// button.setAttribute('type', 'button');
			// button.setAttribute('value', 'Remove');
			// button.setAttribute('id','tableBtn')

			// // add button's "onclick" event.
			// button.setAttribute('onclick', 'deleteClass(\''+input.name+'\')' );

			// td.appendChild(button);
			// tr.appendChild(td);

			table.appendChild(tr);
		}
	});
}

//disable the check boxes
function disableInput(inputForm) {
	arrayOfForms = Array.from(document.getElementsByTagName("input"));
	arrayOfForms.forEach((input) => {
		input.style.display = "none";
	});
	symptomToArray();
}

//function that will speak with the back end to get Diagnosis
function generateDiagnosis() {
	//list of symptoms from the user
	customSymptomList;

	console.log(customSymptomList);

	fetch('/generalInfo', {method: 'GET', body: customSymptomList.toString()}).then((resBuffer) =>{
		resBuffer.json().then(res =>{
			console.log(res);
		})
	})
}
