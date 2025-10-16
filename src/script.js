import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import gsap from 'gsap'
import * as dat from 'lil-gui'

/**
 * Parameters
 */
const parameters = {
    color: 0xffffff,
    background: 0x000000,
    spin_x: () => {
        gsap.to(mesh.rotation, { duration: 1, x: mesh.rotation.x + Math.PI * 2 })
    },
    showText: true 
}

/**
 * Base setup
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(parameters.background)

/**
 * Texture Loading
 */
const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () => console.log('Loading started')
loadingManager.onLoad = () => console.log('All resources loaded')
loadingManager.onError = () => console.log('Error loading resources')

const textureLoader = new THREE.TextureLoader(loadingManager)
const earthTexture = textureLoader.load('textures/earth-texture.jpg')
const matcapTexture = textureLoader.load('textures/matcaps/8.png')

/**
 * Fonts
 */
const fontLoader = new FontLoader()
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
        const textGeometry = new TextGeometry('Earth', {
            font: font,
            size: 0.5,           
            height: 0.05,        
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.005, 
            bevelSize: 0.01,       
            bevelOffset: 0,
            bevelSegments: 3
        })
        textGeometry.center()

        const text = new THREE.Mesh(textGeometry, textMaterial)
        text.position.set(0.01, -1.6, 0)
        scene.add(text)
        window.textMesh = text
    }
)


/**
 * Earth Object
 */
const geometry = new THREE.SphereGeometry(1, 99, 99)
const material = new THREE.MeshStandardMaterial({
    map: earthTexture,
    color: parameters.color
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1.3)
light.position.set(5, 1, 5)
scene.add(light)

const starGeometry = new THREE.SphereGeometry(0.05, 8, 8)
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

for (let i = 0; i < 450; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial)

    star.position.x = (Math.random() - 0.5) * 100
    star.position.y = (Math.random() - 0.5) * 100
    star.position.z = (Math.random() - 0.5) * 100

    const scale = Math.random() * 0.5
    star.scale.set(scale, scale, scale)

    scene.add(star)
}


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animation
 */
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    mesh.rotation.y = 0.1 * elapsedTime
    if (window.textMesh) {
        window.textMesh.rotation.y = 0.1 * elapsedTime
    }
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()

/**
 * Debug GUI
 */
const gui = new dat.GUI()
gui.add(mesh.position, 'y', -3, 3, 0.01).name('Elevation')
gui.add(mesh.position, 'x', -3, 3, 0.01).name('Horizontal')
gui.add(mesh, 'visible')
gui.add(material, 'wireframe')
gui.add(parameters, 'spin_x').name('Spin X')
gui.addColor(parameters, 'color').name('Earth Color').onChange(() => {
    material.color.set(parameters.color)
})
gui.addColor(parameters, 'background').name('Background Color').onChange(() => {
    scene.background.set(parameters.background)
})
gui.add(parameters, 'showText').name('Show Text').onChange((value) => {
    if (window.textMesh) {
        window.textMesh.visible = value
    }
})
