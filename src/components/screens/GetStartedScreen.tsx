import React, { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";

export function GenerativeArtScene() {
  const mountRef = useRef(null);
  const lightRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1); // Pure black background
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.2, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointLightPos: { value: new THREE.Vector3(0, 0, 5) },
        color: { value: new THREE.Color(0xffffff) }, // Pure white glowing
      },
      vertexShader: `                uniform float time;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                // Perlin Noise function
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    vec4 x = x_ * ns.x + ns.yyyy;
                    vec4 y = y_ * ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    vec4 s0 = floor(b0) * 2.0 + 1.0;
                    vec4 s1 = floor(b1) * 2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);
                    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
                    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
                }

                void main() {
                    vNormal = normal;
                    vPosition = position;
                    float displacement = snoise(position * 2.0 + time * 0.5) * 0.2;
                    vec3 newPosition = position + normal * displacement;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }`,
      fragmentShader: `                uniform vec3 color;
                uniform vec3 pointLightPosition;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 lightDir = normalize(pointLightPosition - vPosition);
                    float diffuse = max(dot(normal, lightDir), 0.0);
                    
                    // Fresnel effect for the glow
                    float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
                    fresnel = pow(fresnel, 2.0);
                    
                    vec3 finalColor = color * diffuse + color * fresnel * 0.5;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }`,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 5);
    lightRef.current = pointLight;
    scene.add(pointLight);

    let frameId;
    const animate = (t) => {
      material.uniforms.time.value = t * 0.0003;
      mesh.rotation.y += 0.0005;
      mesh.rotation.x += 0.0002;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate(0);

    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      const vec = new THREE.Vector3(x, y, 0.5).unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(dist));
      lightRef.current.position.copy(pos);
      material.uniforms.pointLightPos.value = pos;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />;
}

export function AnomalousMatterHero({
  title = "Observation Log: Anomaly 7",
  subtitle = "Matter in a state of constant, beautiful flux.",
  description = "A new form of digital existence has been observed. It responds to stimuli, changes form, and exudes an unknown energy. Further study is required.",
}) {
  return (
    <section
      role="banner"
      className="relative w-full h-screen overflow-hidden"
      style={{ 
        backgroundColor: '#000000',
        fontFamily: 'Inter, sans-serif',
        margin: 0,
        padding: 0
      }}
    >
      {/* Mesh container stays behind text */}
      <div className="mesh" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        <Suspense fallback={<div className="w-full h-full" style={{ backgroundColor: '#000000' }} />}>
          <GenerativeArtScene />
        </Suspense>
      </div>

      {/* Text container overlays mesh - centered exactly in middle */}
      <div className="text-overlay" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        textAlign: 'center'
      }}>
        {/* First line - ClassNote AI (app name) */}
        <h2 style={{
          color: '#F8F8F8',
          fontSize: '1.5rem',
          fontWeight: 500,
          opacity: 0.95,
          textShadow: '0 0 10px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.2)',
          marginBottom: '10px',
          margin: 0
        }}>
          {title}
        </h2>
        
        {/* Main quote */}
        <h1 style={{
          color: '#FFFFFF',
          fontSize: '2rem',
          fontWeight: 600,
          lineHeight: 1.4,
          textShadow: '0 0 12px rgba(255, 255, 255, 0.7), 0 0 25px rgba(255, 255, 255, 0.4)',
          filter: 'brightness(1.3)',
          margin: 0
        }}>
          {subtitle}
        </h1>
        
        {/* Last line - Record. Transcribe. Percept. Stride. (pure white) */}
        <p style={{
          color: '#FFFFFF',
          fontSize: '1rem',
          fontWeight: 400,
          marginTop: '14px',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.4), 0 0 25px rgba(255, 255, 255, 0.25)',
          filter: 'brightness(1.2) contrast(1.2)',
          margin: 0
        }}>
          {description}
        </p>
      </div>

      {/* Add CSS animation keyframes */}
      <style jsx>{`
        @keyframes softGlow {
          0% { text-shadow: 0 0 15px rgba(255, 255, 255, 0.6); }
          50% { text-shadow: 0 0 25px rgba(255, 255, 255, 0.9); }
          100% { text-shadow: 0 0 15px rgba(255, 255, 255, 0.6); }
        }
      `}</style>
    </section>
  );
}

interface GetStartedScreenProps {
  onGetStarted: () => void;
}

export function GetStartedScreen({ onGetStarted }: GetStartedScreenProps) {
  const handleClick = () => {
    console.log('Get Started screen clicked - calling onGetStarted');
    onGetStarted();
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer', width: '100%', height: '100vh' }}>
      <AnomalousMatterHero
               title="ClassNotes AI"
        subtitle='"Redefine the way you Study with ClassNotes AI"'
        description="Record. Transcribe. Percept. Stride."
      />
    </div>
  );
}