gsap.ticker.fps(60)
gsap.registerPlugin(ScrollTrigger)

// Clear Scroll Memory
window.history.scrollRestoration = 'manual'

// Canvas
    // Change '.webgl' with a canvas querySelector
const canvas = document.querySelector('.webgl')

// Scene
const scene = new THREE.Scene()

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4)
scene.add(directionalLight)
directionalLight.position.set(0, 10, 10)

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {    
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.position.set(0,0,7 * (1920/1080)/(sizes.width/sizes.height))
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    sliderWidth = slider.clientWidth  - sliderThumbWidth
})

// Texture Loader
const textureLoader = new THREE.TextureLoader()
const boxTexture = textureLoader.load('./images/AspenLogo.png')

const cubeTextureLoader = new THREE.CubeTextureLoader()
const envMapTexture = cubeTextureLoader.load([
    './textures/environmentMaps/1/px.jpg',
    './textures/environmentMaps/1/nx.jpg',
    './textures/environmentMaps/1/py.jpg',
    './textures/environmentMaps/1/ny.jpg',
    './textures/environmentMaps/1/pz.jpg',
    './textures/environmentMaps/1/nz.jpg'
])

// GLTF Loader
const gltfLoader = new THREE.GLTFLoader()

// 3D Objects
// ----------------------------------------------------------------
const scale = 1.5

const boxM = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffffff),
    envMap: envMapTexture,
})

const box1 = new THREE.Mesh(new THREE.BoxGeometry(1,2,1), boxM)
box1.scale.set(scale, scale, scale)
scene.add(box1)
box1.position.set(0.75, 0, 1)
box1.rotation.set(-Math.PI/24, -Math.PI/6, -Math.PI/12)

const box2 = new THREE.Mesh(new THREE.BoxGeometry(1,2,1), boxM)
box2.scale.set(scale, scale, scale)
scene.add(box2)
box2.position.set(4, 1, 0)
box2.rotation.set(Math.PI/24, Math.PI/12, Math.PI/12)

// Blob
const blobM = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xeb5f28),
    emissiveIntensity: 0.05,
    emissive: new THREE.Color(0xffffff),
    envMap: envMapTexture,
    roughness: 0.1,
    metalness: 0.1,
})

const blob = new THREE.MarchingCubes( 64, blobM, true, true, 100000 )
blob.isolation = 30
blob.scale.set(2,2,2)
blob.enableUvs = false
blob.enableColors = false
blob.frustumCulled = false

blob.rotation.x = Math.PI/2

const blobCount = 15

const blobUp = new THREE.Group
blobUp.position.set(-4.5,-2,0)
blobUp.add(blob)
scene.add(blobUp)

const updateCubes = (object, time, numblobs) => {
    object.reset()

    for ( let i = 0; i < numblobs; i ++ ) {
        const subtract = 10
        const strength = 1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 )

        const ballx = Math.sin( i + 1.26 * time * i * 0.25 * ( 1.03 + 0.5 * Math.cos( 0.21 * i ) ) ) * 0.27 + 0.5
        const bally = 0.25 * Math.sin(time * Math.cos(i * 0.253 - 0.12) * 0.2) + 0.5
        const ballz = Math.cos( i + 1.32 * time * 0.1 * Math.sin( ( 0.92 + 0.53 * i ) ) ) * 0.27 + 0.5

        if (i != 0) {
            object.addBall( ballx, bally, ballz, strength, subtract)
        }
        else {
            object.addBall( 0.5 + mouse.x/2, bally, 0.5 - mouse.y/2, strength * 2, subtract)
        }
    }

    object.update()
}

const heroGroup = new THREE.Group
heroGroup.add(box1)
heroGroup.add(box2)
heroGroup.add(blobUp)
scene.add(heroGroup)

// ----------------------------------------------------------------

// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0,0,7 * (1920/1080)/(sizes.width/sizes.height))
scene.add(camera)

// Controls
// const controls = new THREE.OrbitControls(camera, canvas)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = false
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Events
// --------------------------------------

// Nav Startup
let navWidth = document.querySelector('nav').clientWidth
let navNameWidth = document.querySelector('.navName').clientWidth
gsap.to('nav', {duration: 0, width: 0, ease: 'none'})

// Nav Click
let isNavOut = false
const navAnimationDuration = 0.5

const logoBarValues = [
    {width: '1em', x: '0.45em', y: '2em'},
    {width: '1.5em', x: '0em', y: '1.4em'},
    {width: '2.3em', x: '-0.3em', y: '0.7em'},
    {width: '3.2em', x: '-0.3em', y: '0em'},
    {width: '4.6em', x: '-0.2em', y: '1em'},
    {width: '5.6em', x: '0em', y: '0.3em'},
    {width: '6.1em', x: '0em', y: '-0.3em'},
    {width: '6.1em', x: '0em', y: '-1em'},
    {width: '5.9em', x: '0.06em', y: '0em'},
    {width: '5.4em', x: '0.06em', y: '-0.7em'},
    {width: '4em', x: '0.06em', y: '-1.4em'},
    {width: '1.9em', x: '0.06em', y: '-2em'},
]

const logoBars = document.querySelectorAll('.logoBar')

const navToggle = () => {
    if (isModalOut == false) {
        if (isNavOut == false) {
            isNavOut = true
            gsap.to('nav', {duration: navAnimationDuration, width: navWidth, ease: 'Power1.easeOut'})
            gsap.to('.navName', {duration: navAnimationDuration, width: 0, ease: 'Power1.easeOut'})
        }
        else {
            isNavOut = false
            gsap.to('nav', {duration: navAnimationDuration, width: 0, ease: 'Power1.easeOut'})
            gsap.to('.navName', {duration: navAnimationDuration, width: navNameWidth, ease: 'Power1.easeOut'})
        }
    }
}

document.querySelector('.navLogo').addEventListener('click', navToggle)
document.querySelector('.navName').addEventListener('click', navToggle)

// Nav Hover
const navHoverAnimationDuration = 0.3

for (let i = 0; i < logoBars.length; i++) {
    gsap.to(logoBars[i], {duration: 0, width: '6.5em', x: 0, y: logoBarValues[i].y, ease: 'back'})
    gsap.to(logoBars[i], {duration: 0, width: logoBarValues[i].width, x: logoBarValues[i].x, y: 0, ease: 'back'})
}

const navHoverOn = () => {
    if (isModalOut == false) {
        for (let i = 0; i < logoBars.length; i++) {
            gsap.to(logoBars[i], {duration: navHoverAnimationDuration, width: '6.5em', x: 0, y: logoBarValues[i].y, ease: 'back'})
        }
    }

    else {
        gsap.to('.modalClose', {duration: 0.1, scale: 1.05})
        gsap.to('.modalClose', {duration: 0.1, delay: 0.1, scale: 1.})
    }
}

const navHoverOff = () => {
    if (isModalOut == false) {
        for (let i = 0; i < logoBars.length; i++) {
            gsap.to(logoBars[i], {duration: navHoverAnimationDuration, width: logoBarValues[i].width, x: logoBarValues[i].x, y: 0, ease: 'back'})
        }
    }
}

document.querySelector('.navLogo').addEventListener('mouseenter', navHoverOn)
document.querySelector('.navName').addEventListener('mouseenter', navHoverOn)
document.querySelector('.navLogo').addEventListener('mouseleave', navHoverOff)
document.querySelector('.navToggle').addEventListener('mouseleave', navHoverOff)

// Nav Choice
const navChoices = document.querySelectorAll('.navChoice')
const navDots = document.querySelectorAll('.navChoiceDot')
const scrollDestinations = [
    document.querySelector('.productSection').getBoundingClientRect().top - (window.innerHeight - document.querySelector('.productSection').clientHeight)/2,
    document.querySelector('.historySection').getBoundingClientRect().top - (window.innerHeight - document.querySelector('.historySection').clientHeight)/2,
    document.querySelector('.purchaseSection').getBoundingClientRect().top - (window.innerHeight - document.querySelector('.purchaseSection').clientHeight)/2,
    document.querySelector('.photoSection').getBoundingClientRect().top - (window.innerHeight - document.querySelector('.photoSection').clientHeight) + document.querySelector('.bottomBorderSection').clientHeight
    ]

let navClickedIndex = 5
let isNavClicked = false

for (let i = 0; i < navChoices.length; i++) {
    gsap.to(navDots[i], {duration: 0, scale: 0})

    navChoices[i].addEventListener('pointerenter', () => {
        gsap.to(navChoices[i], {duration: 0.1, fontStyle: 'italic', y: -4})
        gsap.to(navDots[i], {duration: 0.1, scale: 1})
    })

    navChoices[i].addEventListener('pointerleave', () => {
        if (navClickedIndex != i) {
            gsap.to(navChoices[i], {duration: 0.1, fontStyle: 'normal', y: 0})
            gsap.to(navDots[i], {duration: 0.1, scale: 0})
        }
    })

    navChoices[i].addEventListener('click', () => {
        if (i != navClickedIndex && isNavClicked == false) {
            isNavClicked = true
            gsap.to(window, {duration: 1, scrollTo: scrollDestinations[i]})
            changeNavChoice(i)
            setTimeout(() => {
                isNavClicked = false
            }, 1000)
        }
    })
}

const changeNavChoice = (i) => {
    navClickedIndex = i
    for (let j = 0; j < navChoices.length; j++) {
        if (navClickedIndex != j) {
            gsap.to(navChoices[j], {duration: 0.1, fontStyle: 'normal', y: 0})
            gsap.to(navDots[j], {duration: 0.1, scale: 0})
        }
        else {
            gsap.to(navChoices[i], {duration: 0.1, fontStyle: 'italic', y: -4})
            gsap.to(navDots[i], {duration: 0.1, scale: 1})
        }
    }
}

// Scroll Nav Change
let scrollY = 0
document.addEventListener('scroll', () => {
    scrollY = window.pageYOffset

    if (isNavClicked == false) {
        if (scrollY < scrollDestinations[0]) {
            changeNavChoice(5)
        }
        else if (scrollY > scrollDestinations[0] && scrollY < scrollDestinations[1] ) {
            changeNavChoice(0)
        }
        else if (scrollY > scrollDestinations[1] && scrollY < scrollDestinations[2] ) {
            changeNavChoice(1)
        }
        else if (scrollY > scrollDestinations[2] && scrollY < scrollDestinations[3] ) {
            changeNavChoice(2)
        }
        else if (scrollY > scrollDestinations[3]) {
            changeNavChoice(3)
        }
    }
})

// Slider Startup
const slider = document.querySelector('#historySlider')
const sliderThumbWidth = document.querySelector('.historySliderThumb').clientWidth
let sliderWidth = slider.clientWidth  - sliderThumbWidth
const milestones = document.querySelectorAll('.historySliderMilestone')

slider.oninput = () => {
    gsap.to('.historySliderThumb', {duration: 1, x: slider.value/5 * sliderWidth})
    gsap.to('.historySliderThumbInner', {duration: 0.2, scale: 0.4, ease: 'Power1.easeOut'})
    gsap.to(milestones[slider.value], {duration: 0.15, delay: 1 - 0.15, scale: 1.1})
    gsap.to(milestones[slider.value], {duration: 0.15, delay: 1 - 0.15 + 0.15, scale: 1})
}

slider.onchange = () => {
    gsap.to('#historySlider', {duration: 0, pointerEvents: 'none'})
    gsap.to('.historySliderThumbInner', {duration: 0.2, delay: 1 - 0.2, scale: 1, ease: 'back'})
    gsap.to('#historySlider', {duration: 0, delay: 2.5, pointerEvents: 'auto'})
    changeYear(yearsArray[prevYearIndex], parseInt(slider.value))
    changeHistoryText(parseInt(slider.value))
}

// Change History Text
const historyTexts = document.querySelectorAll('.historyText')

gsap.to('.historyTextScrapeBar', {duration: 0, transformOrigin: 'right', scaleX: 0})

for (let i = 0; i < historyTexts.length; i++) {
    if (i != 0) {
        gsap.to(historyTexts[i], {duration: 0, delay: 0, display: 'none'})
    }
    else {
        gsap.to(historyTexts[i], {duration: 0, delay: 0, display: 'flex'})
    }
}

const changeHistoryText = (y) => {
    gsap.to('.historyTextScrapeBar', {duration: 1.25, transformOrigin: 'right', scaleX: 1})
    gsap.to('.historyTextScrapeBar', {duration: 1.25, delay: 1.25, transformOrigin: 'left', scaleX: 0})
    for (let i = 0; i < historyTexts.length; i++) {
        if (i != y) {
            gsap.to(historyTexts[i], {duration: 0, delay: 1.25, display: 'none'})
        }
        else {
            gsap.to(historyTexts[i], {duration: 0, delay: 1.25, display: 'flex'})
        }
    }
}

// Change Year
const yearsArray = [1987, 2002, 2008, 2018, 2019, 2023]
let prevYearIndex = 0
const historyDigits = document.querySelectorAll('.historyDigit')
const historyDigitContainers = document.querySelectorAll('.historyDigitContainer')
let dir = 1

const changeYear = (p, i) => {
    if (p !== yearsArray[i]) {
        if (p < yearsArray[i]) {
            p++
            dir = 1
        }

        else {
            p--
            dir = -1
        }

        setTimeout(() => {
            changeYear(p, i)
        }, 250/(Math.abs(p - yearsArray[i]) + 1))
    }

    else {
        prevYearIndex = i
    }
    
    const string = p.toString()
    for (let j = 0; j < 4; j++) {
        if (historyDigits[j].innerText != string[j]) {
            historyDigits[j].innerText = string[j]
            gsap.to(historyDigitContainers[j], {duration: 0.1, y: -10 * dir})
            gsap.to(historyDigitContainers[j], {duration: 0.1, delay: 0.1, y: 0})
        }
    }
}

// Photos Startup
const photoHeight = document.querySelector('.photoSection').clientHeight
gsap.to('.photoCardSection', {duration: 0, height: photoHeight})

// Disable Drag
const photos = document.querySelectorAll('.photo')

for (let i = 0; i < photos.length; i++) {
    photos.ondragstart = () => {
        return false
    }
}

// Card Startup
const cards = document.querySelectorAll('.photoCard')
let isPointerDown = false
let isSwipeAnimating = false
let swipeAnimationTime = 0.25
let swipeSpeedMiltiplier = 2

const cardIndexArray = []
for (let i = 0; i < cards.length; i++) {
    cardIndexArray[i] = i
}

document.querySelector('.photoCardSection').addEventListener('pointerdown', () => {
    isPointerDown = true
    deltaXY = 0
    prevX = mouse.x
    prevY = mouse.y
})

document.querySelector('.photoCardSection').addEventListener('pointerup', () => {
    isPointerDown = false
    deltaXY = 0
    prevX = mouse.x
    prevY = mouse.y
})

document.querySelector('.photoCardSection').addEventListener('pointerleave', () => {
    isPointerDown = false
    deltaXY = 0
    prevX = mouse.x
    prevY = mouse.y
})

// Mouse
const mouse = {
    x: 0,
    y: 0
}

let prevX = 0
let prevY = 0
let deltaXY = 0
let topCardIndex = 0

const pointerMoveEvents = () => {
    if (window.innerWidth > 900) {
        // Pointer Events
        document.addEventListener('pointermove', (e) => {
            mouse.x = e.clientX/window.innerWidth - 0.5
            mouse.y = -(e.clientY/window.innerHeight - 0.5)

            // Cursor Follower
            gsap.to('.cursorFollower', {duration: 1, x: mouse.x * window.innerWidth, y: -mouse.y * window.innerHeight})

            if (isModalOut == true) {
                // Modal Close
                gsap.to('.modalClose', {duration: 0, x: mouse.x * 5, y: -mouse.y *  5 * window.innerWidth/window.innerHeight})

                 // Modal Flowers
                gsap.to('#modalContentPhotoLavender', {duration: 0, x: mouse.x * 5 - 5, y: -mouse.y *  2 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 2 + 45})
                gsap.to('#modalContentPhotoChamomile', {duration: 0, x: mouse.x * 5, y: -mouse.y *  5 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 5 + 45})
                gsap.to('#modalContentPhotoCalendula', {duration: 0, x: mouse.x * 5 + 5, y: -mouse.y *  2 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 2 + 135})
                gsap.to('#modalContentPhotoRosemary', {duration: 0, x: mouse.x * 5, y: -mouse.y *  5 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 5 + 225})

                // Charts
                gsap.to('.modalContentChartsCenter', {duration: 0, rotateY: -mouse.x * 20, rotateX: -mouse.y * 20, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
            }

            else {
                // Product Choice
                gsap.to('.productChoice', {duration: 0, rotateY: -mouse.x * 2, rotateX: -mouse.y * 2})
                    
                // Photo
                gsap.to('.photo', {duration: 0, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
                gsap.to('.photoCard', {duration: 0, rotateY: -mouse.x * 10, rotateX: -mouse.y * 10})
                gsap.to('.photoP', {duration: 0, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
                gsap.to('.photoCardP', {duration: 0, rotateY: -mouse.x * 5, rotateX: -mouse.y * 5})
                
                deltaXY = (((mouse.x - prevX) * window.innerWidth/window.innerHeight)**2 + (mouse.y - prevY)**2)**0.5

                // Swipe
                if (isPointerDown == true && isSwipeAnimating == false) {
                    for (let i = 0; i < cards.length; i++) {
                        if (cardIndexArray[i] == 0) {
                            topCardIndex = i
                        }
                    }

                    if (deltaXY >= 0.3) {
                        swipeCard(swipeAnimationTime)
                        isSwipeAnimating = true
                    }
                }

                // Blob
                gsap.to(blob.rotation, {duration: 1, z: mouse.x * 0.25, x: mouse.y * 0.25 + Math.PI/2})
            }
           
        })
    }
    
    else {
        // Pointer Events - Mobile
        document.addEventListener('touchmove', (e) => {
            mouse.x = e.touches[0].clientX/window.innerWidth - 0.5
            mouse.y = -(e.touches[0].clientY/window.innerHeight - 0.5)
    
            // Cursor Follower
            gsap.to('.cursorFollower', {duration: 0.1, x: mouse.x * window.innerWidth, y: -mouse.y * window.innerHeight})
    
            // Modal Close
            gsap.to('.modalClose', {duration: 0.1, x: mouse.x * 5, y: -mouse.y *  5 * window.innerWidth/window.innerHeight})
    
            // Modal Flowers
            gsap.to('#modalContentPhotoLavender', {duration: 1, x: mouse.x * 10 - 5, y: -mouse.y *  10 * window.innerWidth/window.innerHeight, rotateZ: mouse.x * 2 + 45})
            gsap.to('#modalContentPhotoChamomile', {duration: 1, x: mouse.x * 10, y: -mouse.y *  20 * window.innerWidth/window.innerHeight, rotateZ: mouse.x * 5 + 45})
            gsap.to('#modalContentPhotoCalendula', {duration: 1, x: mouse.x * 10 + 5, y: -mouse.y *  10 * window.innerWidth/window.innerHeight, rotateZ: mouse.x * 2 + 135})
            gsap.to('#modalContentPhotoRosemary', {duration: 1, x: mouse.x * 10, y: -mouse.y *  20 * window.innerWidth/window.innerHeight, rotateZ: mouse.x * 5 + 225})
            
            // Photo
            gsap.to('.photo', {duration: 1, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
            gsap.to('.photoCard', {duration: 1, rotateY: -mouse.x * 10, rotateX: -mouse.y * 10})
            gsap.to('.photoP', {duration: 1, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
            gsap.to('.photoCardP', {duration: 1, rotateY: -mouse.x * 5, rotateX: -mouse.y * 5})
            gsap.to('.productChoice', {duration: 1, rotateY: -mouse.x * 2, rotateX: -mouse.y * 2})
    
            // Charts
            gsap.to('.modalContentChartsCenter', {duration: 1, rotateY: -mouse.x * 20, rotateX: -mouse.y * 20, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
    
            deltaXY = (((mouse.x - prevX) * window.innerWidth/window.innerHeight)**2 + (mouse.y - prevY)**2)**0.5
    
            // Swipe
            if (isPointerDown == true && isSwipeAnimating == false) {
                for (let i = 0; i < cards.length; i++) {
                    if (cardIndexArray[i] == 0) {
                        topCardIndex = i
                    }
                }
    
                if (deltaXY >= 0.3) {
                    swipeCard(swipeAnimationTime)
                    isSwipeAnimating = true
                }
            }
        })
    }
}

pointerMoveEvents()

const swipeCard = (dt) => {
    for (let i = 0; i < cards.length; i++) {
        let swipeIndex = cardIndexArray[i] - 1
        if (swipeIndex < 0) {
            gsap.to(cards[i], {duration: dt, delay: cardIndexArray[i] * dt * 0.5, zIndex: cards.length - swipeIndex, rotateY: 0, rotateZ: 2.5 * swipeIndex + (Math.random() - 0.5)*180, filter: 'brightness(' + 100 - 100 * swipeIndex + '%)', x: (window.innerWidth * swipeIndex * -(mouse.x-prevX) + 0) * swipeSpeedMiltiplier , y: window.innerHeight * swipeIndex * (mouse.y-prevY) * swipeSpeedMiltiplier , z: -100 * swipeIndex, ease: 'Power2.easeOut'})
            gsap.to(cards[i], {duration: dt * 0.5, delay: cardIndexArray[i] * dt * 0.5 + dt, opacity: 0, ease: 'Power2.easeOut'})
            cardIndexArray[i] = cards.length
            swipeIndex = cardIndexArray[i] - 1
        }
        gsap.to(cards[i], {duration: dt, delay: cardIndexArray[i] * dt * 0.5, zIndex: cards.length - swipeIndex, rotateY: -mouse.x * 10, rotateZ: 2.5 * swipeIndex, filter: 'brightness(' + 100 - 100 * swipeIndex + '%)', x: 120 * swipeIndex, y: 10 * swipeIndex, z: -100 * swipeIndex, ease: 'back'})
        if (cardIndexArray[i] == cards.length) {
            gsap.to(cards[i], {duration: dt, delay: cardIndexArray[i] * dt * 0.5 + dt * 0.55, opacity: 1})
        }
        cardIndexArray[i] = swipeIndex
    }
    if (dt != 0) {
        setTimeout(() => {
            isSwipeAnimating = false
        }, (dt + (cards.length - 1) * dt) * 1000)
    }
    else {
        isSwipeAnimating = false
    }
}

swipeCard(0)

// Purchase Events
const purchaseLogos = document.querySelectorAll('.purchaseLogo')
const grayTime = 0.25

for (let i = 0; i < purchaseLogos.length; i++) {
    purchaseLogos[i].addEventListener('pointerenter', () => {
        gsap.to(purchaseLogos[i], {duration: grayTime})
    })

    purchaseLogos[i].addEventListener('pointerleave', () => {
        gsap.to(purchaseLogos[i], {duration: grayTime})
    })
}

// Cursor Follower Events
const cursorIndices = [2,0,0,1,3,3,3,3,3,3,3,5,6,7,4]
const cursorSVGs = document.querySelectorAll('.cursorSVG')
const cursorChoices = document.querySelectorAll('.cursorChoice')

for (let i = 0; i < cursorChoices.length; i++) {
    cursorChoices[i].addEventListener('pointerenter', () => {
        gsap.to('.cursorFollower', {duration: 0.25, width: '6rem', height: '6rem', backgroundColor: '#eb5f2800', ease: 'back'})
        gsap.to(cursorSVGs[cursorIndices[i]], {duration: 0.25, scale: 0.6, ease: 'back'})
        if (cursorIndices[i] == 0) {
            gsap.to(cursorSVGs[cursorIndices[i]], {duration: 0.1, delay: 0.25 + 0.2, scaleY: 0.1})
            gsap.to(cursorSVGs[cursorIndices[i]], {duration: 0.1, delay: 0.35 + 0.2, scaleY: 0.4})
            gsap.to(cursorSVGs[cursorIndices[i]], {duration: 0.1, delay: 0.45 + 0.2, scaleY: 0.1})
            gsap.to(cursorSVGs[cursorIndices[i]], {duration: 0.1, delay: 0.55 + 0.2, scaleY: 0.6})
        }
    })

    cursorChoices[i].addEventListener('pointerleave', () => {
        gsap.to('.cursorFollower', {duration: 0.25, width: '2rem', height: '2rem', backgroundColor: '#eb5f28'})
        gsap.to(cursorSVGs[cursorIndices[i]], {duration: 0.25, scale: 0})
    })
}

// Product Choice Events - Modal
const productChoices = document.querySelectorAll('.productChoice')
const modalContents = document.querySelectorAll('.modalContent')
let isModalOut = false

for (let i = 0; i < productChoices.length; i++) {
    productChoices[i].addEventListener('pointerenter', () => {
        gsap.to(productChoices[i], {duration: 0.2, scale: 1.01})
    })

    productChoices[i].addEventListener('pointerleave', () => {
        gsap.to(productChoices[i], {duration: 0.2, scale: 1})
    })

    productChoices[i].addEventListener('click', () => {
        isModalOut = true

        for (let j = 0; j < modalContents.length; j++) {
            gsap.to(modalContents[j], {duration: 0, display: 'none'})
        }
        gsap.to(modalContents[i], {duration: 0, display: 'flex'})
        gsap.to('.modalSection', {duration: 0, display: 'flex'})
        gsap.to('html', {duration: 0, overflowY: 'hidden'})
        gsap.to('.modalClose', {duration: 0.25, delay: 0.1, scale: 1, ease: 'back'})
        gsap.to('.modalSection', {duration: 0.25, opacity: 1})
        document.querySelector('.modalSection').scrollTo(0,0)

        if (isNavOut == true) {
            isNavOut = false
            gsap.to('nav', {duration: navAnimationDuration, width: 0, ease: 'Power1.easeOut'})
            gsap.to('.navName', {duration: navAnimationDuration, width: navNameWidth, ease: 'Power1.easeOut'})
        }
    })
}

// Modal Close
document.querySelector('.modalClose').addEventListener('pointerenter', () => {
    gsap.to('.modalClose', {duration: 0.1, scale: 1.05})
    gsap.to('.modalClose', {duration: 0.1, delay: 0.1, scale: 1.})
})

document.querySelector('.modalClose').addEventListener('click', () => {
    isModalOut = false

    gsap.to('.modalSection', {duration: 0, delay: 0.3, display: 'none'})
    gsap.to('.modalSection', {duration: 0.25, delay: 0.1, opacity: 0, onComplete: resetModalChart})
    gsap.to('html', {duration: 0, overflowY: 'scroll'})
    gsap.to('.modalClose', {duration: 0.1, scale: 1.05})
    gsap.to('.modalClose', {duration: 0.15, delay: 0.1, scale: 0})

    gsap.to('.navToggle', {duration: 0, pointerEvents: 'auto'})
    gsap.to('.navLogo', {duration: 0, pointerEvents: 'auto'})
})

// Modal Charts
const modalChartsContainers = document.querySelectorAll('.modalContentChartsContainer')
const modalCharts = document.querySelectorAll('.modalContentChartsFill')
const modalChartCenters = document.querySelectorAll('.modalContentChartsCenter')
const modalChartPopupStates = [0,0,0,0,0]
const modalChartPercentages = [92, 100, 93, 92, 86]

const countUp = (p, i) => {
    if (p < modalChartPercentages[i]) {
        if (p < modalChartPercentages[i] - 5) {
            p+=4
        }
        else {
            p++
        }
        modalChartCenters[i].innerText = p + '%'
        setTimeout(() => {
            countUp(p, i)
        }, 4000/(modalChartPercentages[i] + 1))
    }
}

const fillModalChart = (i) => {
    const p = modalChartPercentages[i]
    gsap.fromTo(modalCharts[i], {background: 'conic-gradient(#eb5f28 0% 0%, #eb5f2800 0%)'}, {duration: 1.5, background: 'conic-gradient(#eb5f28 0% ' + p + '%, #eb5f2800 ' + p + '%)', ease: 'Power1.easeOut'})
    countUp(0, i)
}

const resetModalChart = () => {
    for (let i = 0; i < modalCharts.length; i++) {
        gsap.to(modalCharts[i], {duration: 0, background: 'conic-gradient(#eb5f28 0% 0%, #eb5f2800 0%)'})
        modalChartPopupStates[i] = 0
    }
}

// Startup Animations

const textAnimationDivs = []
let textAnimationIndex = 0
const textSetup =  (e, dir) => {
    const string = e.innerText
    e.innerText = ''
    const spans = []
    const divs = []
    const divCs = document.createElement('span')
    divCs.classList.add('textAnimationClassContainer')
    e.appendChild(divCs)

    for (let i = 0; i < string.length; i++) {
        divs[i] = document.createElement('span')
        divs[i].classList.add('t' + textAnimationIndex)
        divCs.appendChild(divs[i])
        divs[i].classList.add('textAnimationClass')
        spans[i] = document.createElement('span')
        spans[i].innerText = string[i]
        divs[i].appendChild(spans[i])
        if (dir == 'up') {
            gsap.to(spans[i], {duration: 0, y: 270, opacity: 0.5})
        }
        else if (dir == 'left') {
            gsap.to(spans[i], {duration: 0, x: -200, opacity: 0.5})
        }
        textAnimationDivs[textAnimationIndex] = spans
    }
    textAnimationIndex++
}

textSetup(document.querySelector('#heroHeaderText1'), 'up')
textSetup(document.querySelector('#heroHeaderText2'), 'up')
textSetup(document.querySelector('#heroHeaderText3'), 'up')
textSetup(document.querySelector('#purchaseTextLine1'), 'up')
textSetup(document.querySelector('#purchaseTextLine2'), 'up')
textSetup(document.querySelector('#purchaseTextLine3'), 'up')
textSetup(document.querySelector('#purchaseTextLine4'), 'up')

const animateText = (e, td, dir) => {
    const spans = textAnimationDivs[e]
    for (let i = 0; i < spans.length; i++) {
        if (dir == 'up') {
            gsap.to(spans[i], {duration: 0.7, delay: i * td, y: 0, opacity: 1})
        }
        else  if (dir == 'left') {
            gsap.to(spans[i], {duration: 0.7, delay: i * td, x: 0, opacity: 1})
        }
    }
}

const startupAnimations = () => {
    animateText(0, 0.1, 'up')
    setTimeout(() => {
        animateText(1, 0.1, 'up')
    }, 5 * 0.1 * 1000)
    setTimeout(() => {
        animateText(2, 0.1, 'up')
    }, 9 * 0.1 * 1000)
}

const purchaseTextAnimations = () => {
    animateText(3, 0.05, 'up')
    setTimeout(() => {
        animateText(4, 0.05, 'up')
    }, 7 * 0.05 * 1000)
    setTimeout(() => {
        animateText(5, 0.05, 'up')
    }, 25 * 0.05 * 1000)
    setTimeout(() => {
        animateText(6, 0.05, 'up')
    }, 37 * 0.05 * 1000)
}

ScrollTrigger.create({
    trigger: '.purchaseSection',
    onEnter: purchaseTextAnimations
})

// Animate
// --------------------------------------
let elapsedTime, blobTime = 0

const clock = new THREE.Clock()

const tick = () => {
    // Call tick again on the next frame
    setTimeout(() => {
        window.requestAnimationFrame(tick)

    }, 1000 / 60)

    if (isModalOut == false) {
        // Marching Cubes
        updateCubes( blob, blobTime, blobCount)
        
        // Render
        if (isModalOut == false) {
            renderer.render(scene, camera)
        }
    }

    // Modal ChartChecker
    if (isModalOut == true) {
        for (let i = 0; i < modalChartsContainers.length; i++) {
            const dy = modalChartsContainers[i].getBoundingClientRect().top - window.innerHeight
            if (dy <= -59 && modalChartPopupStates[i] == 0) {
                modalChartPopupStates[i] = 1
                fillModalChart(i)
            }
        }
    }

    elapsedTime = clock.getElapsedTime()

    blobTime = elapsedTime * 0.15 + 2
}

tick()

// ###########################################################
// ###########################################################
// ###########################################################

// Orbit Canvas
// ###########################################################
// ###########################################################
// ###########################################################

const orbitCanvasJS = () => {
    // Canvas
        // Change '.webgl' with a canvas querySelector
    const canvas = document.querySelector('.orbitCanvas')

    // Scene
    const scene = new THREE.Scene()

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4)
    scene.add(directionalLight)
    directionalLight.position.set(0, 10, 10)

    // Sizes
    const sizes = {
        width: window.innerWidth,
        height: window.innerWidth * 1080/1920
    }

    window.addEventListener('resize', () => {    
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerWidth * 1080/1920

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.position.set(0,0,7 * (1920/1080)/(sizes.width/sizes.height))
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    // Texture Loader
    const textureLoader = new THREE.TextureLoader()
    const boxTexture = textureLoader.load('./images/AspenLogo.png')

    const cubeTextureLoader = new THREE.CubeTextureLoader()
    const envMapTexture = cubeTextureLoader.load([
        './textures/environmentMaps/1/px.jpg',
        './textures/environmentMaps/1/nx.jpg',
        './textures/environmentMaps/1/py.jpg',
        './textures/environmentMaps/1/ny.jpg',
        './textures/environmentMaps/1/pz.jpg',
        './textures/environmentMaps/1/nz.jpg'
    ])

    // GLTF Loader
    const gltfLoader = new THREE.GLTFLoader()

    // 3D Objects
    // ----------------------------------------------------------------
    const scale = 1.5

    const boxM = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffffff),
        envMap: envMapTexture,
    })

    const box1 = new THREE.Mesh(new THREE.BoxGeometry(1,2,1), boxM)
    box1.scale.set(scale, scale, scale)
    scene.add(box1)
    box1.rotation.set(-Math.PI/24, -Math.PI/6, -Math.PI/12)

    const box2 = new THREE.Mesh(new THREE.BoxGeometry(1,2,1), boxM)
    box2.scale.set(scale, scale, scale)
    scene.add(box2)
    box2.rotation.set(Math.PI/24, Math.PI/6, Math.PI/12)

    // ----------------------------------------------------------------

    // Base camera
    const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
    camera.position.set(0,0,7)
    camera.add(directionalLight)
    scene.add(camera)

    // Controls
    const controls = new THREE.OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableZoom = false
    controls.update()

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = false
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Product Choice Events - Modal
    const productChoices = document.querySelectorAll('.productChoice')

    for (let i = 0; i < productChoices.length; i++) {
        productChoices[i].addEventListener('click', () => {
            if (i == 0) {
                scene.remove(box2)
                scene.add(box1)
            }
            else {
                scene.remove(box1)
                scene.add(box2)  
            }
        })
    }

    // Animate
    // --------------------------------------
    const clock = new THREE.Clock()

    const tick2 = () => {
        // Call tick again on the next frame
        setTimeout(() => {
            window.requestAnimationFrame(tick2)

             // Render
            if (isModalOut == true) {
                renderer.render(scene, camera)
            }
        }, 1000 / 60)

        elapsedTime = clock.getElapsedTime()

        controls.update()
    }

    tick2()
}

orbitCanvasJS()

const scrollTriggerJS = () => {
    // ScrollTriggers
    // -------------------------------------------------

    // Product Section
    gsap.fromTo(box1.scale, {x: scale, y: scale, z: scale}, {
        scrollTrigger: {
            trigger: '.productSection',
            start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' bottom',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 1,
            // pin: true,
            // markers: true
        },
        x: scale * 0.75, y: scale * 0.75, z: scale * 0.75,
    })

    gsap.fromTo(box1.position, {x: 0.75, y: 0, z: 1}, {
        scrollTrigger: {
            trigger: '.productSection',
            start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 1,
            // pin: true,
            // markers: true
        },
        x: -2.5, y: 0, z: 1,
    })

    gsap.fromTo(box1.rotation, {x: -Math.PI/24, y: -Math.PI/6, z: -Math.PI/12}, {
        scrollTrigger: {
            trigger: '.productSection',
            start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 1,
            // pin: true,
            // markers: true
        },
        x: 0, y: 0, z: 0,
    })

    gsap.fromTo(box2.scale, {x: scale, y: scale, z: scale}, {
        scrollTrigger: {
            trigger: '.productSection',
            start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 1,
            // pin: true,
            // markers: true
        },
        x: scale * 0.75, y: scale * 0.75, z: scale * 0.75,
    })

    gsap.fromTo(box2.position, {x: 4, y: 1, z: 0}, {
        scrollTrigger: {
            trigger: '.productSection',
            start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 1,
            // pin: true,
            // markers: true
        },
        x: 2.5, y: 0, z: 1,
    })

    gsap.fromTo(box2.rotation, {x: Math.PI/24, y: Math.PI/12, z: Math.PI/12}, {
        scrollTrigger: {
            trigger: '.productSection',
            start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 1,
            // pin: true,
            // markers: true
        },
        x: 0, y: 0, z: 0,
    })

    gsap.fromTo(heroGroup.position, {x: 0, y: 0, z: 0}, {
        scrollTrigger: {
            trigger: '.productSection',
            start: () => document.querySelector('.productSection').clientHeight * 0.55 + ' center',
            end: () => document.querySelector('.productSection').clientHeight * 0.75 + ' top',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 1,
            // pin: true,
            // markers: true
        },
        x: 0, y: 5 * (1920/929)/(sizes.width/sizes.height), z: 5 * (1920/929)/(sizes.width/sizes.height),
    })

    gsap.fromTo(blobUp.position, {x: -7, y: -3, z: -5}, {
        scrollTrigger: {
            trigger: '.productSection',
            start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 1,
            // pin: true,
            // markers: true
        },
        x: 0, y: 0, z: -5,
    })

    // History P to P
    gsap.fromTo('.historyTimelinePtoPLine', {transformOrigin: 'left', scaleX: 0, opacity: 1}, {
        scrollTrigger: {
            trigger: '.historyTimelinePtoP',
            start: () => document.querySelector('.historyTimelinePtoP').clientHeight * 0 + ' bottom',
            // end: () => document.querySelector('.blankSection').clientHeight * 1 + ' bottom',
            toggleActions: "play none none none",
            // snap: 1,
            // scrub: 3
            // pin: true,
            // markers: true
        },
        duration: 3,
        scaleX: 1,
        opacity: 1,
    })

    // Photo Cards
    gsap.fromTo('.photoCardSection', {y: 0, rotateZ: 0}, {
        scrollTrigger: {
            trigger: '.blankSection',
            start: () => document.querySelector('.blankSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.blankSection').clientHeight * 1 + ' bottom',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 3
            // pin: true,
            // markers: true
        },
        y: document.querySelector('.blankSection').clientHeight * 0.5,
        rotateZ: 10,
    })

    // Footer
    gsap.fromTo('.footerBottomText', {y: 100}, {
        scrollTrigger: {
            trigger: '.blankSection',
            start: () => document.querySelector('.blankSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.blankSection').clientHeight * 1 + ' bottom',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 3
            // pin: true,
            // markers: true
        },
        y: 0,
    })

    // Banners
    gsap.fromTo('.bannerPhoto', {y: document.querySelector('.bannerPhoto').clientHeight - document.querySelector('.bannerSection').clientHeight}, {
        scrollTrigger: {
            trigger: '.bannerSection',
            start: () => document.querySelector('.bannerSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.bannerSection').clientHeight * 1 + ' top',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 2,
            // pin: true,
            // markers: true
        },
        y: 0,
    })

    // PhotoP
    gsap.fromTo('#photoCardP1', {y: '35rem'}, {
        scrollTrigger: {
            trigger: '.purchaseSection',
            start: () => document.querySelector('.purchaseSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.purchaseSection').clientHeight * 1 + ' top',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 2,
            // pin: true,
            // markers: true
        },
        y: '-20rem',
    })

    gsap.fromTo('#photoCardP2', {y: '-20rem'}, {
        scrollTrigger: {
            trigger: '.purchaseSection',
            start: () => document.querySelector('.purchaseSection').clientHeight * 0 + ' bottom',
            end: () => document.querySelector('.purchaseSection').clientHeight * 1 + ' top',
            // toggleActions: "play none none reverse",
            // snap: 1,
            scrub: 2,
            // pin: true,
            // markers: true
        },
        y: '-40rem',
    })
}

// ###########################################################

// Load
window.addEventListener('load', () => {
    // gsap.to('.loadingPage', {duration: 1, delay: 1, opacity: 0})
    scrollTriggerJS()
    
    setTimeout(() => {
        startupAnimations()
    }, 1000)
})