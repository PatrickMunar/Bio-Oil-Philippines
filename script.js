// GSAP Settings
gsap.ticker.fps(60)
gsap.registerPlugin(ScrollTrigger)

// Clear Scroll Memory
window.history.scrollRestoration = 'manual'

// Lenis
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical', // vertical, horizontal
    gestureDirection: 'vertical', // vertical, horizontal, both
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

const modalLenis = new Lenis({
    wrapper: document.querySelector('.modalSection'), // element which has overflow
    content: document.querySelector('.modalPopup'), // usually wrapper's direct child
})

const raf = (time) => {
    lenis.raf(time)
    modalLenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

const main = () => {

    // Canvas
        // Change '.webgl' with a canvas querySelector
    const canvas = document.querySelector('.webgl')

    // Scene
    const scene = new THREE.Scene()

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4)

    // Sizes
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    let cameraMaxY = -20

    // Responsive Variable Changes
    if (sizes.width > sizes.height) {
        cameraMaxY = -20
    }
    else {
        cameraMaxY = -50
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
    })

    // Texture Loader
    const textureLoader = new THREE.TextureLoader()
    const versusTexture = textureLoader.load('./textures/Power.png')

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
    const logo3D = new THREE.Group
    const rLogo3D = new THREE.Group
    const logoScale = 0.05

    const gltfLoader = new THREE.GLTFLoader()
    gltfLoader.load(
        './glb/Logo.glb',
        (obj) => {
            rLogo3D.add(obj.scene)
            obj.scene.scale.set(logoScale, logoScale, logoScale)

            obj.scene.children[0].material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xffffff),
                emissive: new THREE.Color(0xeb5f28),
                emissiveIntensity: 0.1,
                envMap: envMapTexture,
                roughness: 0.1,
                metalness: 0.1,
            })
        }
    )
    logo3D.add(rLogo3D)
    logo3D.position.set(0,cameraMaxY * 4.5 / 12,0)
    scene.add(logo3D)

    // 3D Objects
    // ----------------------------------------------------------------
    const scale = 1.5

    const boxM = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xfdfdfd),
        emissive: new THREE.Color(0xeb5f28),
        emissiveIntensity: 0.1,
        envMap: envMapTexture,
        roughness: 0.1,
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
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.4,
        envMap: envMapTexture,
        roughness: 0.1,
        // transparent: true,
        // opacity: 0.95,
    })

    const blob = new THREE.MarchingCubes( 64, blobM, true, true, 100000 )
    blob.isolation = 50
    blob.scale.set(2,2,2)
    blob.enableUvs = false
    blob.enableColors = false
    blob.frustumCulled = true

    blob.rotation.x = Math.PI/2

    const blobCount = 6

    const blobUp = new THREE.Group
    blobUp.position.set(-2,0,2)
    blobUp.add(blob)
    scene.add(blobUp)

    gsap.to(blob.scale, {duration: 0, x: 1.5, z: 1.5})
    gsap.to(blob.rotation, {duration: 0, y: Math.PI/20})

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

    // Versus Particles    
    // Parameters
    const particleGroup = []

    const parameters = {
        size: 1,
        aspect: window.innerWidth/window.innerHeight,
        radius: 0.1,
        groupDiameter: 3
    }

    // Initializations
    const originalPositions = []
    const allParticles = new THREE.Group
    
    let particleIndex = 0

    const addParticle = (w,h) => {
        const particles = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xfdfdfd),
                // color: new THREE.Color(0x00ff00),
                // depthWrite: true,
                // depthTest: true,
            })
        )

        // Particle Positions
        const x = -2 + 0.2 * w
        const y = -2 + 0.2 * h
        const z = 0

        // Save Original Positions
        originalPositions[particleIndex] = [x,y]

        particleGroup.push(particles)
        particleGroup[particleIndex].position.set(x,y,z)
        scene.add(particles)
        allParticles.add(particles)

        particleIndex++
    }

    // Make Particles
    for (let h = 0; h < 20; h++) {
        for (let w = 0; w < 20; w++) {
            addParticle(w,h)
        }
    }

    // Plane Pic
    const planePic = new THREE.Mesh(
        new THREE.PlaneGeometry(652 * 0.005, 591 * 0.005),
        new THREE.MeshBasicMaterial({
            map: versusTexture,
            blending: THREE.MultiplyBlending
        })
    )

    planePic.position.z = 0

    const versusGroup = new THREE.Group
    versusGroup.add(allParticles)
    versusGroup.add(planePic)
    scene.add(versusGroup)
    versusGroup.position.set(0,cameraMaxY * 7.5 / 12,0)

    // ----------------------------------------------------------------

    // Base camera
    const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
    camera.position.set(0,0,7 * (1920/1080)/(sizes.width/sizes.height))
    scene.add(camera)
    camera.add(ambientLight)
    camera.add(directionalLight)
    directionalLight.position.set(10, 10, 10)

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
    const navLetters = []
    navLetters[0] = document.querySelectorAll('.navChoiceLetter1')
    navLetters[1] = document.querySelectorAll('.navChoiceLetter2')
    navLetters[2] = document.querySelectorAll('.navChoiceLetter3')
    navLetters[3] = document.querySelectorAll('.navChoiceLetter4')

    const navTextAnimationDelay = 0.03

    const scrollDestinations = [
        document.querySelector('.productSection').getBoundingClientRect().top - (window.innerHeight - document.querySelector('.productSection').clientHeight)/2,
        document.querySelector('.historySection').getBoundingClientRect().top,
        document.querySelector('.purchaseSection').getBoundingClientRect().top - (window.innerHeight - document.querySelector('.purchaseSection').clientHeight)/2,
        document.querySelector('.photoSection').getBoundingClientRect().top - (window.innerHeight - document.querySelector('.photoSection').clientHeight) + document.querySelector('.bottomBorderSection').clientHeight
        ]

    let navClickedIndex = 5
    let isNavClicked = false

    for (let i = 0; i < navChoices.length; i++) {
        gsap.to(navDots[i], {duration: 0, scale: 0})

        navChoices[i].addEventListener('pointerenter', () => {
            gsap.to(navDots[i], {duration: 0.1, scale: 1})

            for (let j = 0; j < navLetters[i].length; j++) {
                gsap.to(navLetters[i][j], {duration: 0.1, delay: navTextAnimationDelay * j, fontStyle: 'italic', y: -4})
            }
        })

        navChoices[i].addEventListener('pointerleave', () => {
            if (navClickedIndex != i) {
                gsap.to(navChoices[i], {duration: 0.1, fontStyle: 'normal', y: 0})
                gsap.to(navDots[i], {duration: 0.1, scale: 0})

                for (let j = 0; j < navLetters[i].length; j++) {
                    gsap.to(navLetters[i][j], {duration: 0.1, delay: navTextAnimationDelay * j, fontStyle: 'normal', y: 0})
                }
            }
        })

        navChoices[i].addEventListener('click', () => {
            if (i != navClickedIndex && isNavClicked == false) {
                isNavClicked = true
                lenis.scrollTo('html', {offset: scrollDestinations[i], duration: 1, ease: 'none'})
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
                for (let k = 0; k < navLetters[j].length; k++) {
                    gsap.to(navLetters[j][k], {duration: 0.1, delay: navTextAnimationDelay * k, fontStyle: 'normal', y: 0})
                }
                gsap.to(navDots[j], {duration: 0.1, scale: 0})
            }
            else {
                for (let k = 0; k < navLetters[i].length; k++) {
                    gsap.to(navLetters[i][k], {duration: 0.1, delay: navTextAnimationDelay * k, fontStyle: 'italic', y: -4})
                }
                gsap.to(navDots[i], {duration: 0.1, scale: 1})
            }
        }
    }

    // Scroll Nav Change
    let scrollY = 0
    let scrollOnVersus = true

    document.addEventListener('scroll', () => {
        scrollY = window.pageYOffset

        if (isNavClicked == false) {
            if (scrollY < scrollDestinations[0]) {
                changeNavChoice(5)
            }
            else if (scrollY >= scrollDestinations[0] && scrollY < scrollDestinations[1] ) {
                changeNavChoice(0)
            }
            else if (scrollY >= scrollDestinations[1] && scrollY < scrollDestinations[2] ) {
                changeNavChoice(1)
            }
            else if (scrollY >= scrollDestinations[2] && scrollY < scrollDestinations[3] ) {
                changeNavChoice(2)
            }
            else if (scrollY >= scrollDestinations[3]) {
                changeNavChoice(3)
            }
        }
    })

    // Versus Setup
    const versusPointBodys = document.querySelectorAll('.versusPointBody')
    const versusPointButtons = document.querySelectorAll('.versusPointButton')
    const versusPointOuters = document.querySelectorAll('.versusPointOuter')
    const versusBodyStates = [0,0,0]

    for (let i = 0; i < versusPointButtons.length; i++) {
        if (i == 1) {
            gsap.to(versusPointBodys[i], {duration: 0, x: 20, opacity: 0})
        }
        else {
            gsap.to(versusPointBodys[i], {duration: 0, x: -20, opacity: 0})
        }

        versusPointButtons[i].addEventListener('click', () => {
            clickVersusPoint(i)
        })

        versusPointButtons[i].addEventListener('pointerenter', () => {
            if (versusBodyStates[i] == 0) {
                gsap.to(versusPointOuters[i], {duration: 0.2, width: '10rem', height: '10rem'})
            }
        })

        versusPointButtons[i].addEventListener('pointerleave', () => {
            if (versusBodyStates[i] == 0) {
                gsap.to(versusPointOuters[i], {duration: 0.2, width: '8rem', height: '8rem'})
            }
        })
    }

    const clickVersusPoint = (i) => {
        if (versusBodyStates[i] == 0) {
            versusBodyStates[i] = 1

            gsap.to(versusPointOuters[i], {duration: 0.2, width: '9rem', height: '9rem'})
            gsap.to(versusPointOuters[i], {duration: 0.3, delay: 0.2, width: '20rem', height: '20rem', opacity: 0})

            gsap.fromTo(versusPointButtons[i], {rotateZ: '0deg'}, {duration: 0.2, rotateZ: '45deg', scale: 0.85})
            gsap.fromTo(versusPointButtons[i], {scale: 0.9}, {duration: 0.1, delay: 0.2, scale: 0.95})

            if (i == 1) {
                gsap.to(versusPointBodys[i], {duration: 0.5, x: 0, opacity: 1})
            }
            else {
                gsap.to(versusPointBodys[i], {duration: 0.5, x: 0, opacity: 1})
            }
        }
        else {
            versusBodyStates[i] = 0

            gsap.to(versusPointOuters[i], {duration: 0.5, width: '8rem', height: '8rem'})
            gsap.to(versusPointOuters[i], {duration: 0.3, delay: 0.2, opacity: 1})

            gsap.fromTo(versusPointButtons[i], {scale: 0.95}, {duration: 0.1, scale: 0.85})
            gsap.fromTo(versusPointButtons[i], {rotateZ: '45deg'}, {duration: 0.2, delay: 0.1, rotateZ: '0deg', scale: 1})

            if (i == 1) {
                gsap.to(versusPointBodys[i], {duration: 0.5, x: 20, opacity: 0})
            }
            else {
                gsap.to(versusPointBodys[i], {duration: 0.5, x: -20, opacity: 0})
            }
        }
    }

    let isVersusInitialized = false
    const startVersusPoint = () => {
        if (isVersusInitialized == false) {
            isVersusInitialized = true
            clickVersusPoint(0)
        }
    }

    ScrollTrigger.create({
        trigger: '.versusSection',
        start: () => document.querySelector('.versusSection').clientHeight * 0.25 + ' center',
        onEnter: startVersusPoint
    })
    
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
    let topCardIndex = 0

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

    // Follow Links
    const followLinkOuters = document.querySelectorAll('.followLinkOuter')
    const linkArrowSVGs = document.querySelectorAll('.linkArrowSVG')
    const linkIconSVGs = document.querySelectorAll('.linkIconSVG')

    for (let i = 0; i < followLinkOuters.length; i++) {
        gsap.to(linkIconSVGs[i], {duration: 0, x: -30, y: 30})

        followLinkOuters[i].addEventListener('pointerenter', () => {
            gsap.to(linkArrowSVGs[i], {duration: 0.2, x: 30, y: -30})
            gsap.to(linkIconSVGs[i], {duration: 0.2, x: 0, y: 0})
            gsap.to(followLinkOuters[i], {duration: 0.2, x: 2, y: -2, boxShadow: 'inset 1px -1px 5px 0 #0000001a, -3px 3px 3px 0 #0000003a'})
        })

        followLinkOuters[i].addEventListener('pointerleave', () => {
            gsap.to(linkArrowSVGs[i], {duration: 0.2, x: 0, y: 0})
            gsap.to(linkIconSVGs[i], {duration: 0.2, x: -30, y: 30})
            gsap.to(followLinkOuters[i], {duration: 0.2, x: 0, y: 0, boxShadow: 'inset 1px -1px 5px 0 #0000001a, -1px 1px 3px 0 #0000003a'})
        })
    }

    // Mouse
    const pointer = new THREE.Vector3()
    const point = new THREE.Vector3()

    const mouse = {
        x: 0,
        y: 0
    }

    let prevX = 0
    let prevY = 0
    let deltaXY = 0

    const pointerMoveEvents = () => {
        if (window.innerWidth > 900) {
            // Pointer Events
            document.addEventListener('pointermove', (e) => {
                mouse.x = e.clientX/window.innerWidth - 0.5
                mouse.y = -(e.clientY/window.innerHeight - 0.5)

                // Cursor Follower
                gsap.to('.cursorFollower', {duration: 0.5, x: mouse.x * window.innerWidth, y: -mouse.y * window.innerHeight})

                if (isModalOut == true) {
                    // Modal Close
                    // gsap.to('.modalClose', {duration: 0, x: mouse.x * 5, y: -mouse.y *  5 * window.innerWidth/window.innerHeight})

                    // Modal Flowers
                    gsap.to('#modalContentPhotoLavender', {duration: 0, x: mouse.x * 5 - 5, y: -mouse.y *  2 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 2 + 45})
                    gsap.to('#modalContentPhotoChamomile', {duration: 0, x: mouse.x * 5, y: -mouse.y *  5 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 5 + 45})
                    gsap.to('#modalContentPhotoCalendula', {duration: 0, x: mouse.x * 5 + 5, y: -mouse.y *  2 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 2 + 135})
                    gsap.to('#modalContentPhotoRosemary', {duration: 0, x: mouse.x * 5, y: -mouse.y *  5 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 5 + 225})

                    // Charts
                    // gsap.to('.modalContentChartsCenter', {duration: 0, rotateY: -mouse.x * 20, rotateX: -mouse.y * 20, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
                }

                else {
                    if (scrollY < scrollDestinations[1]) {
                        // Product Choice
                        if (productEnterValue == 0) {
                            gsap.to(productChoices[0], {duration: 0, rotateY: -mouse.x * 10, rotateX: -mouse.y * 4})
                            gsap.to(productImages[0], {duration: 0, rotateY: mouse.x * 10, rotateX: mouse.y * 4})
                        }
                        else if (productEnterValue == 1) {
                            gsap.to(productChoices[1], {duration: 0, rotateY: -mouse.x * 10, rotateX: -mouse.y * 4})
                            gsap.to(productImages[1], {duration: 0, rotateY: mouse.x * 10, rotateX: mouse.y * 4})
                        }
                        else {
                            // Blob
                            // gsap.to(blob.rotation, {duration: 1, z: mouse.x * 0.25, x: mouse.y * 0.25 + Math.PI/2})
                        }
                        // Logo
                        gsap.to(rLogo3D.rotation, {duration: 2, y: mouse.x * Math.PI/6, x: -mouse.y * Math.PI/6})

                        // Versus
                        // gsap.to('.versusPointButton', {duration: 1, x: -mouse.x * 10, y: mouse.y * 10 * window.innerWidth/window.innerHeight})
                        gsap.to('.versusImage', {duration: 1, x: -mouse.x * 10, y: mouse.y * 10 * window.innerWidth/window.innerHeight})
                        // gsap.to('.versusImageParallaxDiv', {duration: 1, x: mouse.x * 10, y: -mouse.y * 10 * window.innerWidth/window.innerHeight})

                        // 3D --------------
                        if (scrollOnVersus == true) {
                            // Update Pointer Coordinates
                            pointer.set(
                                ( e.clientX / window.innerWidth ) * 2 - 1,
                                - ( e.clientY / window.innerHeight ) * 2 + 1,
                                0.575
                            )

                            // Match Mouse and 3D Pointer Coordinates
                            pointer.unproject(camera)
                            pointer.sub(camera.position).normalize()
                            let distance = -(camera.position.z) / pointer.z
                            point.copy(camera.position).add((pointer.multiplyScalar(distance)))

                            // Check for Affected Particles
                            for (let i = 0; i < particleGroup.length; i++) {
                                const distanceFromPointerSquared = (particleGroup[i].position.x - pointer.x)**2 + (particleGroup[i].position.y + (versusGroup.position.y - camera.position.y) - pointer.y)**2
                                const directionVector = new THREE.Vector2(particleGroup[i].position.x - pointer.x, particleGroup[i].position.y + (versusGroup.position.y - camera.position.y) - pointer.y)

                                // Case: Affected
                                if (distanceFromPointerSquared < parameters.radius) {
                                    // Spread
                                    gsap.to(particleGroup[i].position, {duration: 0.1, x: particleGroup[i].position.x + directionVector.x * 0.5, y: particleGroup[i].position.y + directionVector.y * 0.5})

                                    // Size Change
                                    gsap.to(particleGroup[i].scale, {duration: 0.1, x: 0, y: 0, z: 0})
                                    gsap.to(particleGroup[i].scale, {duration: 1, delay: 0.1, x: 1, y: 1, z: 1})
                                    gsap.to(particleGroup[i].position, {duration: 1, delay: 0.1, x: originalPositions[i][0], y: originalPositions[i][1]})
                                }
                            } 
                        }

                    }
                        
                    // Photo
                    if (scrollY >= scrollDestinations[1]) {
                        gsap.to('.photo', {duration: 0, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
                        gsap.to('.photoCard', {duration: 0, rotateY: -mouse.x * 10, rotateX: -mouse.y * 10})
                        gsap.to('.photoP', {duration: 0, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
                        gsap.to('.photoCardP', {duration: 0, rotateY: -mouse.x * 5, rotateX: -mouse.y * 5})
                    }
                    
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
                }
            })
        }
        
        else {
            // Pointer Events - Mobile
            document.addEventListener('touchmove', (e) => {
                mouse.x = e.touches[0].clientX/window.innerWidth - 0.5
                mouse.y = -(e.touches[0].clientY/window.innerHeight - 0.5)

                // 3D --------------
                // Update Pointer Coordinates
                pointer.set(
                    ( e.touches[0].clientX / window.innerWidth ) * 2 - 1,
                    - ( e.touches[0].clientY / window.innerHeight ) * 2 + 1,
                    0.575
                )

                // Match Mouse and 3D Pointer Coordinates
                pointer.unproject(camera)
                pointer.sub(camera.position).normalize()
                let distance = -(camera.position.z) / pointer.z
                point.copy(camera.position).add((pointer.multiplyScalar(distance)))

                // Check for Affected Particles
                for (let i = 0; i < particleGroup.length; i++) {
                    const distanceFromPointerSquared = (particleGroup[i].position.x - pointer.x)**2 + (particleGroup[i].position.y + (versusGroup.position.y - camera.position.y) - pointer.y)**2
                    const directionVector = new THREE.Vector2(particleGroup[i].position.x - pointer.x, particleGroup[i].position.y + (versusGroup.position.y - camera.position.y) - pointer.y)

                    // Case: Affected
                    if (distanceFromPointerSquared < parameters.radius) {
                        // Spread
                        gsap.to(particleGroup[i].position, {duration: 0.1, x: particleGroup[i].position.x + directionVector.x * 0.5, y: particleGroup[i].position.y + directionVector.y * 0.5})

                        // Size Change
                        gsap.to(particleGroup[i].scale, {duration: 0.1, x: 0, y: 0, z: 0})
                        gsap.to(particleGroup[i].scale, {duration: 1, delay: 0.1, x: 1, y: 1, z: 1})
                        gsap.to(particleGroup[i].position, {duration: 1, delay: 0.1, x: originalPositions[i][0], y: originalPositions[i][1]})
                    }
                } 

                // Cursor Follower
                gsap.to('.cursorFollower', {duration: 0.5, x: mouse.x * window.innerWidth, y: -mouse.y * window.innerHeight})

                if (isModalOut == true) {
                    // Modal Close
                    // gsap.to('.modalClose', {duration: 0, x: mouse.x * 5, y: -mouse.y *  5 * window.innerWidth/window.innerHeight})

                    // Modal Flowers
                    gsap.to('#modalContentPhotoLavender', {duration: 0, x: mouse.x * 5 - 5, y: -mouse.y *  2 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 2 + 45})
                    gsap.to('#modalContentPhotoChamomile', {duration: 0, x: mouse.x * 5, y: -mouse.y *  5 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 5 + 45})
                    gsap.to('#modalContentPhotoCalendula', {duration: 0, x: mouse.x * 5 + 5, y: -mouse.y *  2 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 2 + 135})
                    gsap.to('#modalContentPhotoRosemary', {duration: 0, x: mouse.x * 5, y: -mouse.y *  5 * window.innerWidth/window.innerHeight, rotateZ: -mouse.x * 5 + 225})

                    // Charts
                    // gsap.to('.modalContentChartsCenter', {duration: 0, rotateY: -mouse.x * 20, rotateX: -mouse.y * 20, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
                }

                else {
                    if (scrollY < scrollDestinations[1]) {
                        // Product Choice
                        if (productEnterValue == 0) {
                            gsap.to(productChoices[0], {duration: 0, rotateY: -mouse.x * 10, rotateX: -mouse.y * 4})
                            gsap.to(productImages[0], {duration: 0, rotateY: mouse.x * 10, rotateX: mouse.y * 4})
                        }
                        else if (productEnterValue == 1) {
                            gsap.to(productChoices[1], {duration: 0, rotateY: -mouse.x * 10, rotateX: -mouse.y * 4})
                            gsap.to(productImages[1], {duration: 0, rotateY: mouse.x * 10, rotateX: mouse.y * 4})
                        }
                        else {
                            // Blob
                            // gsap.to(blob.rotation, {duration: 1, z: mouse.x * 0.25, x: mouse.y * 0.25 + Math.PI/2})
                        }
                        // Logo
                        gsap.to(rLogo3D.rotation, {duration: 2, y: mouse.x * Math.PI/6, x: -mouse.y * Math.PI/6})

                        // gsap.to('.versusPointButton', {duration: 1, x: -mouse.x * 10, y: mouse.y * 10 * window.innerWidth/window.innerHeight})
                        gsap.to('.versusImage', {duration: 1, x: -mouse.x * 10, y: mouse.y * 10 * window.innerWidth/window.innerHeight})
                        // gsap.to('.versusImageParallaxDiv', {duration: 1, x: mouse.x * 10, y: -mouse.y * 10 * window.innerWidth/window.innerHeight})
                    }
                        
                    // Photo
                    if (scrollY >= scrollDestinations[1]) {
                        gsap.to('.photo', {duration: 0, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
                        gsap.to('.photoCard', {duration: 0, rotateY: -mouse.x * 10, rotateX: -mouse.y * 10})
                        gsap.to('.photoP', {duration: 0, x: -mouse.x * 5, y: mouse.y * 5 * window.innerWidth/window.innerHeight})
                        gsap.to('.photoCardP', {duration: 0, rotateY: -mouse.x * 5, rotateX: -mouse.y * 5})
                    }
                    
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
                gsap.to(cards[i], {duration: dt * 0.5, delay: cardIndexArray[i] * dt * 0.5 + dt, opacity: 0, ease: 'none'})
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
    const purchaseLinkButtons = document.querySelectorAll('.purchaseLinkButton')

    for (let i = 0; i < purchaseLinkButtons.length; i++) {
        purchaseLinkButtons[i].addEventListener('pointerenter', () => {
            gsap.to(purchaseLinkButtons[i], {duration: 0.2, x: 2, y: -2, boxShadow: 'inset 1px -1px 5px 0 #0000001a, -3px 3px 3px 0 #0000003a'})
        })

        purchaseLinkButtons[i].addEventListener('pointerleave', () => {
            gsap.to(purchaseLinkButtons[i], {duration: 0.2, x: 0, y: 0, boxShadow: 'inset 1px -1px 5px 0 #0000001a, -1px 1px 3px 0 #0000003a'})
        })
    }

    // Cursor Follower Events
    const cursorIndices = [2,0,0,3,3,3,3,3,3,3,4]
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

    const cursorTexts = document.querySelectorAll('.cursorText')
    gsap.to('.cursorText', {duration: 0, opacity: 0, scale: 0})

    const modalContentPlantPhotos = document.querySelectorAll('.modalContentPlantPhoto')
    gsap.to('.modalContentPlantPhoto', {duration: 0, filter: 'brightness(1)'})

    for (let i = 0; i < modalContentPlantPhotos.length; i++) {
        modalContentPlantPhotos[i].addEventListener('pointerenter', () => {
            gsap.to(modalContentPlantPhotos[i], {duration: 0.25, filter: 'brightness(0.8)'})

            if (modalContentPlantPhotos[i].id == 'modalContentPhotoLavender') {
                gsap.to(cursorTexts[0], {duration: 0.25, opacity: 1, scale: 1})
            }
            else if (modalContentPlantPhotos[i].id == 'modalContentPhotoChamomile') {
                gsap.to(cursorTexts[1], {duration: 0.25, opacity: 1, scale: 1})
            }
            else if (modalContentPlantPhotos[i].id == 'modalContentPhotoCalendula') {
                gsap.to(cursorTexts[2], {duration: 0.25, opacity: 1, scale: 1})
            }
            else if (modalContentPlantPhotos[i].id == 'modalContentPhotoRosemary') {
                gsap.to(cursorTexts[3], {duration: 0.25, opacity: 1, scale: 1})
            }
        })

        modalContentPlantPhotos[i].addEventListener('pointerleave', () => {
            gsap.to('.modalContentPlantPhoto', {duration: 0.25, filter: 'brightness(1)'})

            gsap.to(cursorTexts[0], {duration: 0.25, opacity: 0, scale: 0})
            gsap.to(cursorTexts[1], {duration: 0.25, opacity: 0, scale: 0})
            gsap.to(cursorTexts[2], {duration: 0.25, opacity: 0, scale: 0})
            gsap.to(cursorTexts[3], {duration: 0.25, opacity: 0, scale: 0})
        })
    }

    // Product Choice Events - Modal
    const productChoices = document.querySelectorAll('.productChoice')
    const modalContents = document.querySelectorAll('.modalContent')
    const productImages = document.querySelectorAll('.productImage')
    let isModalOut = false
    let productEnterValue = 2
    let affectedChartsState = [0,0,0,0,0]

    for (let i = 0; i < productChoices.length; i++) {
        productChoices[i].addEventListener('pointerenter', () => {
            gsap.to(productChoices[i], {duration: 0.2, scale: 1.01})
            gsap.to(productImages[i], {duration: 0.2, scale: 1.05})
            productEnterValue = i
        })

        productChoices[i].addEventListener('pointerleave', () => {
            gsap.to(productChoices[i], {duration: 0.2, scale: 1})
            gsap.to(productImages[i], {duration: 0.2, scale: 1})
            productEnterValue = 2

            gsap.to(productChoices[0], {duration: 0, rotateY: 0, rotateX: 0})
            gsap.to(productImages[0], {duration: 0, rotateY: 0, rotateX: 0})
            gsap.to(productChoices[1], {duration: 0, rotateY: 0, rotateX: 0})
            gsap.to(productImages[1], {duration: 0, rotateY: 0, rotateX: 0})
        })

        productChoices[i].addEventListener('click', () => {
            if (isModalOut == false) {
                isModalOut = true

                if (i == 0) {
                    affectedChartsState = [1,1,1,0,0]
                }
                else {
                    affectedChartsState = [0,0,0,1,1]
                }

                for (let j = 0; j < modalContents.length; j++) {
                    gsap.to(modalContents[j], {duration: 0, display: 'none'})
                }
                gsap.to(modalContents[i], {duration: 0, display: 'flex'})
                gsap.to('.modalSection', {duration: 0, display: 'flex'})
                gsap.to('html', {duration: 0, overflowY: 'hidden'})
                gsap.to('.modalClose', {duration: 0, opacity: 1, pointerEvents: 'auto', x: '0rem'})
                gsap.to('.modalClose', {duration: 0.25, delay: 0.1, scale: 1, ease: 'back'})
                gsap.to('.modalSection', {duration: 0, marginTop: '10rem'})
                gsap.to('.modalSection', {duration: 0.25, opacity: 1, marginTop: '0rem'})
                document.querySelector('.modalSection').scrollTo(0,0)

                if (isNavOut == true) {
                    isNavOut = false
                    gsap.to('nav', {duration: navAnimationDuration, width: 0, ease: 'Power1.easeOut'})
                    gsap.to('.navName', {duration: navAnimationDuration, width: navNameWidth, ease: 'Power1.easeOut'})
                }
            }
        })
    }

    // Modal Close
    let isModalCloseClicked = false

    document.querySelector('.modalClose').addEventListener('pointerenter', () => {
        if (isModalOut == true) {
            gsap.to('.modalClose', {duration: 0.125, scale: 1.05})
        }
    })

    document.querySelector('.modalClose').addEventListener('pointerleave', () => {
        if (isModalOut == true && isModalCloseClicked == false) {
            gsap.to('.modalClose', {duration: 0.125, scale: 1})
        }
    })

    document.querySelector('.modalClose').addEventListener('click', () => {
        if (isModalOut == true) {
            setTimeout(() => {
                isModalOut = false
                isModalCloseClicked = false
            }, 600)

            isModalCloseClicked = true

            affectedChartsState = [0,0,0,0,0]

            gsap.to('.modalSection', {duration: 0, delay: 0.3, display: 'none'})
            gsap.to('.modalSection', {duration: 0.25, delay: 0.1, opacity: 0, onComplete: resetModalChart})
            gsap.to('html', {duration: 0, overflowY: 'scroll'})
            gsap.to('.modalClose', {duration: 0, pointerEvents: 'none', scale: 1.05, x: '1rem'})
            gsap.to('.modalClose', {duration: 0.15, scale: 0.9})
            gsap.to('.modalClose', {duration: 0.15, delay: 0.2, scale: 1})
            gsap.to('.modalClose', {duration: 0.25, delay: 0.35, opacity: 0})

            gsap.to('.navToggle', {duration: 0, pointerEvents: 'auto'})
            gsap.to('.navLogo', {duration: 0, pointerEvents: 'auto'})
        }
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

    // Text Animations
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
            else if (dir == 'upHero') {
                gsap.to(spans[i], {duration: 0, y: 270, scaleY: 1, opacity: 0.5})
            }
            else if (dir == 'left') {
                gsap.to(spans[i], {duration: 0, x: -200, opacity: 0.5})
            }
        }
        textAnimationDivs[textAnimationIndex] = spans
        textAnimationIndex++
    }

    textSetup(document.querySelector('#heroHeaderText1'), 'upHero')
    textSetup(document.querySelector('#heroHeaderText2'), 'upHero')
    textSetup(document.querySelector('#heroHeaderText3'), 'upHero')

    textSetup(document.querySelector('#purchaseTextLine1'), 'up')
    textSetup(document.querySelector('#purchaseTextLine2'), 'up')
    textSetup(document.querySelector('#purchaseTextLine3'), 'up')
    textSetup(document.querySelector('#purchaseTextLine4'), 'up')

    const animateText = (e, td, dir) => {
        const spans = textAnimationDivs[e]
        for (let i = 0; i < spans.length; i++) {
            if (dir == 'upHero') {
                gsap.to(spans[i], {duration: 0.7, delay: i * td, y: 0, opacity: 1, scaleY: 1})
                // gsap.to(spans[i], {duration: 0.25, delay: i * td + 1, textShadow: '5px 0px 0px #878787'})
            }
            else if (dir == 'upHero1') {
                gsap.to(spans[i], {duration: 1, delay: i * td, y: 0, opacity: 1, ease: 'back'})
                gsap.to(spans[i], {duration: 0.25, delay: i * td + 1, textShadow: '5px 5px 0px #878787'})
            }
            else if (dir == 'upHero2') {
                gsap.to(spans[i], {duration: 1, delay: i * td, y: 0, opacity: 1, ease: 'back'})
                gsap.to(spans[i], {duration: 0.25, delay: i * td + 1, textShadow: '5px 0px 0px #878787'})
            }
            else if (dir == 'upHero3') {
                gsap.to(spans[i], {duration: 1, delay: i * td, y: 0, opacity: 1, ease: 'back'})
                gsap.to(spans[i], {duration: 0.25, delay: i * td + 1, textShadow: '5px -5px 0px #878787'})
            }
            else if (dir == 'up') {
                gsap.to(spans[i], {duration: 0.7, delay: i * td, y: 0, opacity: 1})
            }
            else  if (dir == 'left') {
                gsap.to(spans[i], {duration: 0.7, delay: i * td, x: 0, opacity: 1})
            }
        }
    }

    // Startup Animations
    gsap.to(box1.rotation, {duration: 0, y: -Math.PI/6 + Math.PI})
    gsap.to(box1.position, {duration: 0, y: 0 - 7})
    gsap.to(box2.rotation, {duration: 0, y: Math.PI/12 + Math.PI})
    gsap.to(box2.position, {duration: 0, y: 1 - 7})
    gsap.to('.heroSubHeaderText', {duration: 0, opacity: 0})
    gsap.to('.scrollCTACircle', {duration: 0, y: '-24rem'})
    gsap.to('.scrollCTAText1', {duration: 0, opacity: 0})
    gsap.to('.scrollCTAText2', {duration: 0, opacity: 0})

    const startupAnimations = () => {
        // Scroll
        gsap.to('.scrollCTACircle', {duration: 4.25, y: '0rem'})
        gsap.to('.scrollCTAText1', {duration: 2, delay: 2.25, opacity: 1})
        gsap.to('.scrollCTAText1', {duration: 2, delay: 5.25, opacity: 0})
        gsap.to('.scrollCTAText2', {duration: 2, delay: 6.25, opacity: 1})

        // Text
        setTimeout(() => {
            animateText(0, 0.1, 'upHero')
            setTimeout(() => {
                animateText(1, 0.1, 'upHero')
            }, 5 * 0.07 * 1000)
            setTimeout(() => {
                animateText(2, 0.1, 'upHero')
            }, 9 * 0.07 * 1000)
        }, 700)

        gsap.to('.heroSubHeaderText', {duration: 1, delay: 2.5, opacity: 1})

        // Blob
        gsap.fromTo(blob.scale, {x: 1.5, z: 1.5}, {duration: 2, x: 2, z: 2})
        gsap.fromTo(blob.rotation, {y: Math.PI/20}, {duration: 2, y: 0})

        // Boxes
        gsap.to(box1.rotation, {duration: 1.5, y:-Math.PI/6, ease: 'Power3.easeOut'})
        gsap.to(box1.position, {duration: 1.5, y: 0, ease: 'Power3.easeOut'})
        gsap.to(box2.rotation, {duration: 1.5, delay: 0.35, y:Math.PI/12, ease: 'Power3.easeOut'})
        gsap.to(box2.position, {duration: 1.5, delay: 0.35, y: 1, ease: 'Power3.easeOut'})
    }

    // Purchase Text Animations
    const purchaseTextGreys = document.querySelectorAll('.purchaseTextGrey')
    const purchaseTextDelays = [0.3,0.6,1.25,2.25,3.1]
    gsap.to('.purchaseLinks1', {duration: 0, opacity: 0, pointerEvents: 'none', boxShadow: 'inset -1px 1px 5px 0 #0000001a, 0px 0px 0px 0 #0000003a'})
    gsap.to('.purchaseLinks2', {duration: 0, opacity: 0, pointerEvents: 'none', boxShadow: 'inset -1px 1px 5px 0 #0000001a, 0px 0px 0px 0 #0000003a'})
    gsap.to('.purchaseLinks3', {duration: 0, opacity: 0, pointerEvents: 'none', boxShadow: 'inset -1px 1px 5px 0 #0000001a, 0px 0px 0px 0 #0000003a'})
    for (let i = 0; i < purchaseTextGreys.length; i++) {
        gsap.to(purchaseTextGreys[i], {duration: 0, opacity: 0})
    }

    const purchaseTextAnimations = () => {
        for (let i = 0; i < purchaseTextGreys.length; i++) {
            gsap.to(purchaseTextGreys[i], {duration: 1, delay: purchaseTextDelays[i], opacity: 1})
        }
        gsap.to('.purchaseLinks1', {duration: 0.75, delay: 1.25, opacity: 1})
        gsap.to('.purchaseLinks2', {duration: 0.75, delay: 2, opacity: 1})
        gsap.to('.purchaseLinks3', {duration: 0.75, delay: 3, opacity: 1})
        gsap.to('.purchaseLinks1', {duration: 0.75, delay: 2, boxShadow: 'inset 1px -1px 5px 0 #0000001a, -1px 1px 3px 0 #0000003a'})
        gsap.to('.purchaseLinks2', {duration: 0.75, delay: 2.75, boxShadow: 'inset 1px -1px 5px 0 #0000001a, -1px 1px 3px 0 #0000003a'})
        gsap.to('.purchaseLinks3', {duration: 0.75, delay: 3.75, boxShadow: 'inset 1px -1px 5px 0 #0000001a, -1px 1px 3px 0 #0000003a'})
        gsap.to('.purchaseLinks1', {duration: 0, delay: 2.75, pointerEvents: 'auto'})
        gsap.to('.purchaseLinks2', {duration: 0, delay: 3.5, pointerEvents: 'auto'})
        gsap.to('.purchaseLinks3', {duration: 0, delay: 4.5, pointerEvents: 'auto'})

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
        start: () => document.querySelector('.purchaseSection').clientHeight * 0.25 + ' bottom',
        onEnter: purchaseTextAnimations
    })

    // Animate
    // --------------------------------------
    let elapsedTime, blobTime = 0

    const clock = new THREE.Clock()

    const tick = () => {
        if (isModalOut == false) {
            // Marching Cubes
            if (blobUp.position.y - camera.position.y < 5) {
                updateCubes( blob, blobTime, blobCount)
            }
            
            // Render
            renderer.render(scene, camera)
        }

        blobTime = elapsedTime * 0.2 + 45
    }

    // tick()

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

        // 3D Objects
        // ----------------------------------------------------------------
        const scale = 1.5

        const boxM = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xfdfdfd),
            emissive: new THREE.Color(0xeb5f28),
            emissiveIntensity: 0.1,
            envMap: envMapTexture,
            roughness: 0.1,
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

        const dy = []

        // Animate
        // --------------------------------------

        const tick2 = () => {
            // Render
            if (isModalOut == true) {
                renderer.render(scene, camera)

                for (let i = 0; i < modalChartsContainers.length; i++) {
                    if (affectedChartsState[i] == 1) {
                        dy[i] = modalChartsContainers[i].getBoundingClientRect().top - window.innerHeight
                        if (dy[i] <= -59 && modalChartPopupStates[i] == 0) {
                            modalChartPopupStates[i] = 1
                            fillModalChart(i)
                        }
                    }
                }
            }

            controls.update()
        }


        // tick2()
        const tickMain = () => {
            elapsedTime = clock.getElapsedTime()

            // Call tick again on the next frame
            // setTimeout(() => {
                if (isModalOut == true) {
                    tick2()
                }
                else {
                    tick()
                }
                
                window.requestAnimationFrame(tickMain)
            // }, 1000 / 60)
        }

        tickMain()
    }

    orbitCanvasJS()

    const scrollTriggerJS = () => {
        // ScrollTriggers
        // -------------------------------------------------

        // Camera
        gsap.fromTo(camera.position, {y: 0}, {
            scrollTrigger: {
                trigger: '.heroSection',
                start: () => document.querySelector('.heroSection').clientHeight * 0 + ' top',
                end: () => window.innerHeight * 5 + ' top',
                // toggleActions: "play none none reverse",
                // snap: 1,
                scrub: true,
                // pin: true,
                // markers: true
            },
            y: cameraMaxY,
        })

        // Logo
        gsap.fromTo(logo3D.rotation, {y: 0}, {
            scrollTrigger: {
                trigger: '.productSection',
                start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true
            },
            y: Math.PI * 2
        })

        // Cards
        gsap.fromTo('.productChoice', {y: '5rem'}, {
            scrollTrigger: {
                trigger: '.productSection',
                start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true
            },
            y: '0rem'
        })

        gsap.fromTo('.productImage', {y: '-10rem'}, {
            scrollTrigger: {
                trigger: '.productSection',
                start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true
            },
            y: '0rem'
        })

        gsap.fromTo('#skincareChoice', {transformOrigin: 'bottom center', x: '-20rem', rotateZ: '-10deg'}, {
            scrollTrigger: {
                trigger: '.productSection',
                start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true
            },
            x: '0rem',
            rotateZ: '0deg'
        })

        gsap.fromTo('#dryskinChoice', {transformOrigin: 'bottom center', x: '20rem', rotateZ: '10deg'}, {
            scrollTrigger: {
                trigger: '.productSection',
                start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true
            },
            x: '0rem',
            rotateZ: '0deg'
        })

        // Sub Header
        gsap.fromTo('.heroSubHeaderText1', {opacity: 1}, {
            scrollTrigger: {
                trigger: '.productSection',
                start: () => document.querySelector('.productSection').clientHeight * 0.2 + ' bottom',
                // end: () => document.querySelector('.productSection').clientHeight * 0 + ' top',
                toggleActions: "play none none reverse",
                // ,
                // scrub: true,
                // pin: true,
                // markers: true
            },
            duration: 0.5,
            opacity: 0
        })

        gsap.fromTo('.heroSubHeaderText2', {y: '0rem'}, {
            scrollTrigger: {
                trigger: '.productSection',
                start: () => document.querySelector('.productSection').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.productSection').clientHeight * 0.5 + ' center',
                // toggleActions: "play none none reverse"
                scrub: true,
                // pin: true,
                // markers: true
            },
            y: '15rem',
        })

        // Versus
        gsap.fromTo('#versusImageParallaxDiv1', {y: 100 * 5}, {
            scrollTrigger: {
                trigger: '.versusSection',
                start: () => document.querySelector('.versusSection').clientHeight * 0 + 2 + ' bottom',
                end: () => document.querySelector('.versusSection').clientHeight * 1 + ' top',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            y: -100 * 5/3,
        })
  
        gsap.fromTo('#versusImageParallaxDiv2', {y: 100 * 2}, {
            scrollTrigger: {
                trigger: '.versusSection',
                start: () => document.querySelector('.versusSection').clientHeight * 0 + 2 + ' bottom',
                end: () => document.querySelector('.versusSection').clientHeight * 1 + ' top',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            y: -100 * 2/3,
        })
          
        gsap.fromTo('#versusImageParallaxDiv3', {y: 100 * 7}, {
            scrollTrigger: {
                trigger: '.versusSection',
                start: () => document.querySelector('.versusSection').clientHeight * 0 + 2 + ' bottom',
                end: () => document.querySelector('.versusSection').clientHeight * 1 + ' top',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            y: -100 * 7/3,
        })

        gsap.fromTo('#versusImageParallaxDiv4', {y: 100 * 6}, {
            scrollTrigger: {
                trigger: '.versusSection',
                start: () => document.querySelector('.versusSection').clientHeight * 0 + 2 + ' bottom',
                end: () => document.querySelector('.versusSection').clientHeight * 1 + ' top',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            y: -100 * 6/3,
        })

        // History Extras
        gsap.fromTo('.hpbbanner', {y: '5rem'}, {
            scrollTrigger: {
                trigger: '.history1',
                start: () => document.querySelector('.history1').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history1').clientHeight * 1 + ' top',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            y: '-5rem',
        })

        gsap.fromTo('.hpobanner', {y: '8rem'}, {
            scrollTrigger: {
                trigger: '.history1',
                start: () => document.querySelector('.history1').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history1').clientHeight * 1 + ' top',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            y: '-8rem',
        })

        gsap.fromTo('.heblur', {y: '10rem'}, {
            scrollTrigger: {
                trigger: '.historySection',
                start: () => document.querySelector('.historySection').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.historySection').clientHeight * 1 + ' top',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            y: '-7rem',
        })

        gsap.fromTo('.heo1', {y: '20rem'}, {
            scrollTrigger: {
                trigger: '.historySection',
                start: () => document.querySelector('.historySection').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.historySection').clientHeight * 1 + ' top',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            y: '-10rem',
        })

        gsap.fromTo('.heo2', {y: '10rem'}, {
            scrollTrigger: {
                trigger: '.historySection',
                start: () => document.querySelector('.historySection').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.historySection').clientHeight * 1 + ' top',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            y: '0rem',
        })

        // History Popups
        gsap.fromTo('.historyBanner1', {x: -document.querySelector('.historyBanner1').clientWidth}, {
            scrollTrigger: {
                trigger: '.history1',
                start: () => document.querySelector('.history1').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history1').clientHeight * 1 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: 1,
                // pin: true,
                // markers: true,
            },
            x: 0,
        })

        gsap.fromTo('.historyBannerPhoto', {x: document.querySelector('.historyBanner1').clientWidth}, {
            scrollTrigger: {
                trigger: '.history1',
                start: () => document.querySelector('.history1').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history1').clientHeight * 1 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: 1,
                // pin: true,
                // markers: true,
            },
            x: 0,
        })

        gsap.fromTo('.historyBannerPhoto', {y: '0rem'}, {
            scrollTrigger: {
                trigger: '.history1',
                start: () => document.querySelector('.history1').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history1').clientHeight * 1 + ' top',
                // toggleActions: "play none none none",
                // ,
                scrub: 1,
                // pin: true,
                // markers: true,
            },
            y: '10rem',
        })

        gsap.fromTo('.historySectionExtraOrangeBorderBanner', {scale: 0}, {
            scrollTrigger: {
                trigger: '.history1',
                start: () => document.querySelector('.history1').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history1').clientHeight * 1 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: 1,
                // pin: true,
                // markers: true,
            },
            scale: 1,
        })

        gsap.fromTo('.historySectionExtraOrangeBorder', {scale: 0}, {
            scrollTrigger: {
                trigger: '.history2',
                start: () => document.querySelector('.history2').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history2').clientHeight * 1 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: 1,
                // pin: true,
                // markers: true,
            },
            scale: 1,
        })

        gsap.fromTo('.historySectionExtraOrangeBorder2', {scale: 0}, {
            scrollTrigger: {
                trigger: '.history3',
                start: () => document.querySelector('.history3').clientHeight * 0.5 + ' bottom',
                end: () => document.querySelector('.history3').clientHeight * 1.5 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: 1,
                // pin: true,
                // markers: true,
            },
            scale: 1,
        })

        gsap.fromTo('.historySectionExtraImageContainer1', {scale: 0.5}, {
            scrollTrigger: {
                trigger: '.history2',
                start: () => document.querySelector('.history2').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history2').clientHeight * 1 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            scale: 1,
        })

        gsap.fromTo('#historySectionExtraImage1', {scale: 2}, {
            scrollTrigger: {
                trigger: '.history2',
                start: () => document.querySelector('.history2').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history2').clientHeight * 1 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            scale: 1,
        })

        gsap.fromTo('.historySectionExtraImageContainer2', {scale: 0.5}, {
            scrollTrigger: {
                trigger: '.history2',
                start: () => document.querySelector('.history2').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history2').clientHeight * 1 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            scale: 1,
        })

        gsap.fromTo('#historySectionExtraImage2', {scale: 2}, {
            scrollTrigger: {
                trigger: '.history2',
                start: () => document.querySelector('.history2').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.history2').clientHeight * 1 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            scale: 1,
        })

        gsap.fromTo('.historySectionExtraImageContainer3', {scale: 0.5}, {
            scrollTrigger: {
                trigger: '.history3',
                start: () => document.querySelector('.history3').clientHeight * 0.5 + ' bottom',
                end: () => document.querySelector('.history3').clientHeight * 1.5 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            scale: 1,
        })

        gsap.fromTo('#historySectionExtraImage3', {scale: 2}, {
            scrollTrigger: {
                trigger: '.history3',
                start: () => document.querySelector('.history3').clientHeight * 0.5 + ' bottom',
                end: () => document.querySelector('.history3').clientHeight * 1.5 + ' bottom',
                // toggleActions: "play none none none",
                // ,
                scrub: true,
                // pin: true,
                // markers: true,
            },
            scale: 1,
        })

        // Photo Cards
        gsap.fromTo('.photoCardSection', {y: 0, rotateZ: 0}, {
            scrollTrigger: {
                trigger: '.blankSection',
                start: () => document.querySelector('.blankSection').clientHeight * 0 + ' bottom',
                end: () => document.querySelector('.blankSection').clientHeight * 1 + ' bottom',
                // toggleActions: "play none none reverse",
                // ,
                scrub: true
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
                // ,
                scrub: true
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
                // toggleActions: "play none none reverse"
                // ,
                scrub: true,
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
                // ,
                scrub: true,
                // pin: true,
                // markers: true
            },
            y: '-40rem',
        })
    }

    scrollTriggerJS()
    setTimeout(() => {
        startupAnimations()
    }, 750)
}

// ###########################################################

// Load
window.addEventListener('load', () => {
    gsap.to('.loadingPage', {duration: 1, delay: 1, opacity: 0})
    main()
})