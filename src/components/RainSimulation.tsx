import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer, RenderPass, BloomEffect, EffectPass, SMAAEffect } from 'postprocessing';

interface RainSimulationProps {
  intensity: number;
}

const RainSimulation: React.FC<RainSimulationProps> = ({ intensity }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 1, 1000);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.6;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add point lights for glow effect
    const addPointLight = (x: number, y: number, z: number, intensity: number, color: number) => {
      const light = new THREE.PointLight(color, intensity, 100);
      light.position.set(x, y, z);
      scene.add(light);
    };

    addPointLight(10, 0, 10, 2, 0xff0000);
    addPointLight(-10, 0, -10, 2, 0x0000ff);
    addPointLight(0, 10, 0, 2, 0xffffff);

    // Raindrop material
    const raindropMaterial = new THREE.PointsMaterial({
      color: 0xADD8E6,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });

    // Raindrop geometry
    const raindropGeometry = new THREE.BufferGeometry();
    const maxRaindrops = 100000;
    const positions = new Float32Array(maxRaindrops * 3);
    const velocities = new Float32Array(maxRaindrops * 3);

    for (let i = 0; i < maxRaindrops * 3; i += 3) {
      positions[i] = Math.random() * 200 - 100;
      positions[i + 1] = Math.random() * 200;
      positions[i + 2] = Math.random() * 100 - 50;

      velocities[i] = 0;
      velocities[i + 1] = -0.1 - Math.random() * 0.1;
      velocities[i + 2] = 0;
    }

    raindropGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create particle system
    const particleSystem = new THREE.Points(raindropGeometry, raindropMaterial);
    scene.add(particleSystem);

    // Load San Francisco skyline model
    const loader = new GLTFLoader();
    loader.load(
      '/san_francisco_city.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, -30, -20);
        model.scale.set(0.025, 0.025, 0.025);

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.emissive = new THREE.Color(0x333333);
            child.material.emissiveIntensity = 0.3;
          }
        });

        scene.add(model);

        // Adjust camera after model is loaded
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        camera.position.set(center.x, center.y + size.y * 0.7, center.z + size.y * 1.5);
        camera.lookAt(center);

        // Add moon after the city is loaded
        addMoon(center, size);
      },
      (progress) => {
        console.log(`Loading model... ${(progress.loaded / progress.total) * 100}%`);
      },
      (error) => {
        console.error('An error occurred while loading the model:', error);
      }
    );

    // Function to add moon
    const addMoon = (cityCenter: THREE.Vector3, citySize: THREE.Vector3) => {
      loader.load(
        '/moon.glb',
        (gltf) => {
          const moonModel = gltf.scene;
          const moonScale = 25;
          moonModel.scale.set(moonScale, moonScale, moonScale);
          
          moonModel.position.set(
            cityCenter.x - citySize.x * 0.8,
            cityCenter.y + citySize.y * 2.2,
            cityCenter.z - citySize.z * 0.5
          );
          
          scene.add(moonModel);

          // Add blue light from the moon
          const moonLight = new THREE.PointLight(0x4169E1, 2, 500);
          moonLight.position.copy(moonModel.position);
          scene.add(moonLight);
        },
        undefined,
        (error) => {
          console.error('An error occurred while loading the moon model:', error);
        }
      );
    };

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomEffect = new BloomEffect({
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.7,
      intensity: 0.5
    });
    const smaaEffect = new SMAAEffect();

    composer.addPass(new EffectPass(camera, bloomEffect, smaaEffect));

    // Mouse movement tracking
    const mouse = new THREE.Vector2();
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    const cameraMoveAmount = 0.05;

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX - windowHalfX) / windowHalfX;
      mouse.y = (event.clientY - windowHalfY) / windowHalfY;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Update camera position based on mouse movement
      camera.position.x += (mouse.x * cameraMoveAmount - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * cameraMoveAmount - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      const positionAttribute = particleSystem.geometry.getAttribute('position');
      const positions = (positionAttribute as THREE.BufferAttribute).array as Float32Array;
      const activeRaindrops = Math.floor(maxRaindrops * (intensity + 1) / 5);
      const windForce = intensity === 4 ? 0.02 : 0;

      for (let i = 0; i < maxRaindrops * 3; i += 3) {
        if (i < activeRaindrops * 3) {
          positions[i] += windForce;
          positions[i + 1] += velocities[i + 1] * (1 + intensity * 0.5);

          if (positions[i + 1] < -30) {
            positions[i] = Math.random() * 200 - 100;
            positions[i + 1] = 200;
            positions[i + 2] = Math.random() * 100 - 50;
            velocities[i + 1] = (-0.1 - Math.random() * 0.1) * (1 + intensity * 0.5);
          }
        } else {
          positions[i] = 1000;
          positions[i + 1] = 1000;
          positions[i + 2] = 1000;
        }
      }

      positionAttribute.needsUpdate = true;

      composer.render();
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [intensity]);

  return <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
};

export default RainSimulation;