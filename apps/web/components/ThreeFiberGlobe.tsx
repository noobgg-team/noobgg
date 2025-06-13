'use client';

import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Text,
  Billboard,
} from '@react-three/drei';
import * as THREE from 'three';
import { Globe, Users, MapPin, Gamepad2, Mouse, ZoomIn, Target } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// GeoJSON Feature interface
interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    NAME: string;
    NAME_LONG: string;
    ISO_A3: string;
    CONTINENT: string;
    REGION_UN: string;
    POP_EST: number;
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Country data for rendering
interface CountryData {
  name: string;
  coordinates: number[][];
  population: number;
  continent: string;
  color: string;
}

// City data interface
interface CityData {
  name: string;
  country: string;
  lat: number;
  lng: number;
  population: number;
  type: 'capital' | 'major' | 'megacity';
}

// Major cities data (capital cities and major population centers)
const MAJOR_CITIES: CityData[] = [
  // Asia
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, population: 37400000, type: 'megacity' },
  { name: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025, population: 32900000, type: 'megacity' },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, population: 28500000, type: 'megacity' },
  { name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, population: 21700000, type: 'capital' },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, population: 21700000, type: 'megacity' },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842, population: 13400000, type: 'capital' },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, population: 9700000, type: 'capital' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, population: 11000000, type: 'capital' },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, population: 10700000, type: 'capital' },
  { name: 'Tehran', country: 'Iran', lat: 35.6892, lng: 51.3890, population: 9500000, type: 'capital' },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, population: 9500000, type: 'capital' },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011, population: 16100000, type: 'megacity' },

  // Europe
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, population: 15500000, type: 'megacity' },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6176, population: 12500000, type: 'capital' },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, population: 9500000, type: 'capital' },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, population: 11000000, type: 'capital' },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, population: 3700000, type: 'capital' },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, population: 6700000, type: 'capital' },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, population: 4300000, type: 'capital' },

  // North America
  { name: 'New York', country: 'United States of America', lat: 40.7128, lng: -74.0060, population: 18800000, type: 'megacity' },
  { name: 'Los Angeles', country: 'United States of America', lat: 34.0522, lng: -118.2437, population: 12400000, type: 'major' },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, population: 21800000, type: 'capital' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, population: 6200000, type: 'major' },
  { name: 'Chicago', country: 'United States of America', lat: 41.8781, lng: -87.6298, population: 9500000, type: 'major' },

  // South America
  { name: 'São Paulo', country: 'Brazil', lat: -23.5558, lng: -46.6396, population: 22400000, type: 'megacity' },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6118, lng: -58.3960, population: 15200000, type: 'capital' },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, population: 13300000, type: 'major' },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, population: 11000000, type: 'capital' },
  { name: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721, population: 11000000, type: 'capital' },

  // Africa
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, population: 15400000, type: 'megacity' },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, population: 21300000, type: 'capital' },
  { name: 'Kinshasa', country: 'Dem. Rep. Congo', lat: -4.4419, lng: 15.2663, population: 15600000, type: 'capital' },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, population: 10000000, type: 'major' },

  // Oceania
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, population: 5400000, type: 'major' },
];

// Function to load real country data from GeoJSON
async function loadRealCountriesFromGeoJSON(): Promise<CountryData[]> {
  try {
    const response = await fetch('/data/all.geojson');
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
    }

    const geoData: GeoJSONData = await response.json();

    const countries: CountryData[] = [];

    geoData.features.forEach((feature) => {
      const coordinates: number[][] = [];

      // Extract coordinates from different geometry types
      if (feature.geometry.type === 'Polygon') {
        const coords = feature.geometry.coordinates[0] as number[][];
        coordinates.push(...coords);
      } else if (feature.geometry.type === 'MultiPolygon') {
        const multiCoords = feature.geometry.coordinates as number[][][][];
        multiCoords.forEach((polygon) => {
          const coords = polygon[0] as number[][];
          coordinates.push(...coords);
        });
      }

      // Assign continent-based colors
      const getContinentColor = (continent: string): string => {
        switch (continent) {
          case 'North America': return '#3b82f6'; // Blue
          case 'South America': return '#10b981'; // Green
          case 'Europe': return '#8b5cf6'; // Purple
          case 'Asia': return '#f59e0b'; // Orange
          case 'Africa': return '#ef4444'; // Red
          case 'Oceania': return '#06b6d4'; // Cyan
          case 'Antarctica': return '#6b7280'; // Gray
          default: return '#9ca3af'; // Gray default
        }
      };        // Only keep countries with population > 10M (reduced to show more countries)
      const population = feature.properties.POP_EST || 0;

      // Skip low population countries
      if (population < 10000000) {
        return;
      }

      countries.push({
        name: feature.properties.NAME,
        coordinates,
        population: feature.properties.POP_EST || 0,
        continent: feature.properties.CONTINENT || 'Unknown',
        color: getContinentColor(feature.properties.CONTINENT || 'Unknown')
      });
    });

    return countries;
  } catch (error) {
    console.error('Error loading countries from GeoJSON:', error);
    return [];
  }
}

// Convert lat/lng to 3D coordinates
function latLngToVector3(lat: number, lng: number, radius: number = 5) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Globe rotation context for syncing all elements
const GlobeRotationContext = React.createContext<{ rotation: number }>({ rotation: 0 });

// Wireframe Earth Globe - now a simple static component
const EarthGlobe = React.memo(() => {
  return (
    <mesh>
      <sphereGeometry args={[5, 16, 8]} />
      <meshBasicMaterial
        color="#2563eb"
        wireframe={true}
        transparent={true}
        opacity={0.3}
      />
    </mesh>
  );
});

EarthGlobe.displayName = 'EarthGlobe';

// Real Countries from GeoJSON - Renders actual country boundaries as dots
const RealCountries = React.memo(({ orbitControlsRef, countries }: {
  orbitControlsRef: React.RefObject<OrbitControlsImpl | null>;
  countries: CountryData[];
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Apply rotation to match the globe view from OrbitControls
  useFrame(() => {
    if (groupRef.current && orbitControlsRef.current) {
      groupRef.current.rotation.y = -orbitControlsRef.current.getAzimuthalAngle();
    }
  });

  // Convert GeoJSON coordinates to 3D points on sphere with 2x density
  const countryPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];

    countries.forEach((country) => {
      const color = new THREE.Color(country.color);

      // Sample coordinates for better performance - doubled density
      country.coordinates.forEach((coord, index) => {
        if (coord.length >= 2) {
          const [lng, lat] = coord;
          if (!isNaN(lat) && !isNaN(lng)) {
            // Convert lat/lng to 3D sphere coordinates
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);

            const point = new THREE.Vector3(
              -(5.05 * Math.sin(phi) * Math.cos(theta)),
              5.05 * Math.cos(phi),
              5.05 * Math.sin(phi) * Math.sin(theta)
            );

            points.push(point);
            colors.push(color);
            // Add multiple interpolated points between coordinates for 4x density
            if (index > 0) {
              const prevCoord = country.coordinates[index - 1];
              if (prevCoord && prevCoord.length >= 2) {
                const [prevLng, prevLat] = prevCoord;
                if (!isNaN(prevLat) && !isNaN(prevLng)) {
                  // Add 3 interpolated points between each coordinate pair
                  for (let i = 1; i <= 3; i++) {
                    const ratio = i / 4; // 0.25, 0.5, 0.75
                    const interpLat = prevLat + (lat - prevLat) * ratio;
                    const interpLng = prevLng + (lng - prevLng) * ratio;

                    const interpPhi = (90 - interpLat) * (Math.PI / 180);
                    const interpTheta = (interpLng + 180) * (Math.PI / 180);

                    const interpPoint = new THREE.Vector3(
                      -(5.05 * Math.sin(interpPhi) * Math.cos(interpTheta)),
                      5.05 * Math.cos(interpPhi),
                      5.05 * Math.sin(interpPhi) * Math.sin(interpTheta)
                    );

                    points.push(interpPoint);
                    colors.push(color);
                  }
                }
              }
            }
          }
        }
      });
    });

    return { points, colors };
  }, [countries]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(countryPoints.points.length * 3);
    const colorArray = new Float32Array(countryPoints.points.length * 3);

    countryPoints.points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;

      const color = countryPoints.colors[i];
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    });

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    return geom;
  }, [countryPoints]);
  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          size={0.025}
          vertexColors={true}
          transparent={true}
          opacity={0.9}
          sizeAttenuation={false}
        />
      </points>
    </group>
  );
});

RealCountries.displayName = 'RealCountries';

// City Hubs - Shows major cities as simple dots
const CityHubs = React.memo(({ orbitControlsRef, onCityClick }: {
  orbitControlsRef: React.RefObject<OrbitControlsImpl | null>;
  onCityClick?: (city: CityData) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Apply rotation to match the globe view from OrbitControls
  useFrame(() => {
    if (groupRef.current && orbitControlsRef.current) {
      groupRef.current.rotation.y = -orbitControlsRef.current.getAzimuthalAngle();
    }
  });

  return (
    <group ref={groupRef}>
      {MAJOR_CITIES.map((city, index) => (
        <CityHub
          key={`${city.name}-${index}`}
          city={city}
          onClick={onCityClick}
        />
      ))}
    </group>
  );
});

CityHubs.displayName = 'CityHubs';

// Individual City Hub Component - Simple dots with labels
const CityHub = React.memo(({
  city,
  onClick
}: {
  city: CityData;
  onClick?: (city: CityData) => void;
}) => {
  // Convert lat/lng to 3D coordinates
  const position = useMemo(() => {
    const phi = (90 - city.lat) * (Math.PI / 180);
    const theta = (city.lng + 180) * (Math.PI / 180);

    return new THREE.Vector3(
      -(5.1 * Math.sin(phi) * Math.cos(theta)),
      5.1 * Math.cos(phi),
      5.1 * Math.sin(phi) * Math.sin(theta)
    );
  }, [city.lat, city.lng]);

  // Get hub color and size based on city type
  const { color, size } = useMemo(() => {
    switch (city.type) {
      case 'megacity':
        return { color: '#ff6b6b', size: 0.12 }; // Red for megacities
      case 'capital':
        return { color: '#4ecdc4', size: 0.10 }; // Cyan for capitals
      default:
        return { color: '#45b7d1', size: 0.08 }; // Blue for major cities
    }
  }, [city.type]);
  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onClick?.(city);
  }, [city, onClick]);

  const handlePointerEnter = useCallback(() => {
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerLeave = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);

  return (
    <group position={position}>
      {/* Simple bright dot for city */}
      <mesh
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* City name label */}
      <Billboard
        position={[0, size + 0.15, 0]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Text
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          fontSize={0.12}
          outlineWidth={0.008}
          outlineColor="#000000"
          maxWidth={3}
          textAlign="center"
          fontWeight="bold"
        >
          {city.name}
        </Text>
      </Billboard>
    </group>
  );
});

CityHub.displayName = 'CityHub';

// Country Information Marker - Shows country details on hover
const CountryMarker = React.memo(({ country, onHover, orbitControlsRef, onClick }: {
  country: CountryData,
  onHover: (country: CountryData | null) => void,
  orbitControlsRef: React.RefObject<OrbitControlsImpl | null>,
  onClick?: () => void
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Use first coordinate as center point for the marker
  const basePosition = useMemo(() => {
    if (country.coordinates.length > 0) {
      const [lng, lat] = country.coordinates[0];
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);

      return new THREE.Vector3(
        -(5.15 * Math.sin(phi) * Math.cos(theta)),
        5.15 * Math.cos(phi),
        5.15 * Math.sin(phi) * Math.sin(theta)
      );
    }
    return new THREE.Vector3(0, 0, 0);
  }, [country.coordinates]);

  useFrame((state) => {
    // Apply globe rotation to the marker group
    if (groupRef.current && orbitControlsRef.current) {
      groupRef.current.rotation.y = -orbitControlsRef.current.getAzimuthalAngle();
    }

    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <group position={basePosition}>
        <mesh
          ref={meshRef}
          onPointerEnter={() => onHover(country)}
          onPointerLeave={() => onHover(null)}
          onClick={onClick}
        >
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshBasicMaterial color={country.color} />
        </mesh>
        <Billboard position={[0, 0.15, 0]}>
          <Text
            fontSize={0.05}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.005}
            outlineColor="#000000"
          >
            {country.name === 'United States of America' ||
              country.name === 'United States' ||
              country.name === 'USA' ? '' : country.name}
          </Text>
        </Billboard>
      </group>
    </group>
  );
});

CountryMarker.displayName = 'CountryMarker';

// Atmosphere with shader-like effect - Optimized
const Atmosphere = React.memo(() => {
  const atm1Ref = useRef<THREE.Mesh>(null);
  const atm2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (atm1Ref.current) {
      atm1Ref.current.rotation.y += 0.0003;
      atm1Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (atm2Ref.current) {
      atm2Ref.current.rotation.y += 0.0005;
      atm2Ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <>
      <mesh ref={atm1Ref}>
        <sphereGeometry args={[5.2, 32, 16]} />
        <meshBasicMaterial
          color="#4fc3f7"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={atm2Ref}>
        <sphereGeometry args={[5.4, 24, 12]} />
        <meshBasicMaterial
          color="#3f51b5"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />      </mesh>
    </>
  );
});

Atmosphere.displayName = 'Atmosphere';

// Starfield background component
const Starfield = React.memo(() => {
  const starsRef = useRef<THREE.Points>(null);
  const stars = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];    // Create 600 stars scattered in a large sphere (balanced amount)
    for (let i = 0; i < 600; i++) {// Random position in a large sphere - much farther back
      const radius = 150 + Math.random() * 100; // Stars very far from globe
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);      // Different star colors (white, blue, yellow, red giants) - balanced visibility
      const starType = Math.random();
      if (starType < 0.7) {
        // White stars - slightly brighter
        colors.push(0.7, 0.7, 0.7);
      } else if (starType < 0.85) {
        // Blue stars - slightly brighter
        colors.push(0.5, 0.6, 0.8);
      } else if (starType < 0.95) {
        // Yellow stars - slightly brighter
        colors.push(0.7, 0.7, 0.5);
      } else {
        // Red giants - slightly brighter
        colors.push(0.7, 0.4, 0.3);
      }
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors)
    };
  }, []);
  // Gentle twinkling animation - optimized for performance
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0001; // Very slow rotation

      // Less frequent size updates for better performance
      if (Math.floor(state.clock.elapsedTime * 2) % 3 === 0) {
        const material = starsRef.current.material as THREE.PointsMaterial;
        material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      }
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[stars.positions, 3]}
        />        <bufferAttribute
          attach="attributes-color"
          args={[stars.colors, 3]}
        />
      </bufferGeometry>      <pointsMaterial
        size={0.6}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.4}
        vertexColors={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={true}
      />
    </points>
  );
});

Starfield.displayName = 'Starfield';

// Main Scene Component - Refactored for Real Countries
const Scene = React.memo(({
  onCountryHover,
  isMobile,
  selectedCountry,
  setSelectedCountry,
  showCountries = true,
  countries = [],
  isLoadingCountries = false,
  onCityClick,
  selectedCity,
  isMouseOverRef
}: {
  onCountryHover: (country: CountryData | null) => void,
  isMobile: boolean,
  selectedCountry: CountryData | null,
  setSelectedCountry: (country: CountryData | null) => void,
  showCountries?: boolean,
  countries?: CountryData[],
  isLoadingCountries?: boolean,
  onCityClick?: (city: CityData) => void,
  selectedCity?: CityData | null,
  isMouseOverRef: React.RefObject<boolean>
}) => {
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  // Directly manipulate OrbitControls to avoid re-renders on hover
  useFrame(() => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      const shouldAutoRotate = !isMouseOverRef.current && !selectedCountry && !selectedCity;
      if (controls.autoRotate !== shouldAutoRotate) {
        controls.autoRotate = shouldAutoRotate;
      }
    }
  });

  return (
    <group>
      {/* Stars first - rendered in background */}
      <Starfield />

      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4fc3f7" />

      {/* Invisible sphere for mouse interaction */}
      <mesh
        visible={false}
        onPointerEnter={(e) => {
          e.stopPropagation();
          isMouseOverRef.current = true;
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          isMouseOverRef.current = false;
        }}
      >
        <sphereGeometry args={[5, 64, 64]} />
      </mesh>

      <EarthGlobe />
      {/* Render real countries if enabled and data is available */}
      {showCountries && countries.length > 0 && (
        <RealCountries orbitControlsRef={orbitControlsRef} countries={countries} />
      )}

      {/* Render city hubs */}
      <CityHubs orbitControlsRef={orbitControlsRef} onCityClick={onCityClick} />
      {/* Render country markers for interaction - reduced number */}
      {countries.length > 0 && countries.slice(0, 5).map((country, index) => (
        <CountryMarker
          key={`country-${index}`}
          country={country}
          onHover={selectedCountry ? () => { } : onCountryHover}
          orbitControlsRef={orbitControlsRef}
          onClick={() => {
            setSelectedCountry(country);
            if (typeof onCountryHover === 'function') onCountryHover(null);
          }}
        />
      ))}

      <Atmosphere />

      <OrbitControls
        ref={orbitControlsRef}
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        zoomSpeed={0.8}
        rotateSpeed={0.5}
        minDistance={isMobile ? 15 : 8}
        maxDistance={isMobile ? 40 : 30}
        autoRotateSpeed={0.5}
        makeDefault
      />
    </group>
  );
});

Scene.displayName = 'Scene';

// Error Boundary for WebGL context issues - Enhanced
class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorInfo: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('WebGL Error Boundary caught:', error);
    return {
      hasError: true,
      errorInfo: error.message.includes('context') ? 'WebGL Context Issue' : 'Rendering Error'
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('WebGL Error Details:', error, errorInfo);

    // Attempt automatic recovery for context loss
    if (error.message.includes('context') || error.message.includes('WebGL')) {
      setTimeout(() => {
        this.setState({ hasError: false, errorInfo: null });
      }, 3000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-[800px] bg-gradient-to-b from-purple-900/20 to-blue-900/20 rounded-xl">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-4">⚠️ {this.state.errorInfo || 'WebGL Error'}</div>
            <p className="text-white text-sm mb-4">
              {this.state.errorInfo === 'WebGL Context Issue'
                ? 'Graphics context will be restored automatically...'
                : 'Unable to load 3D Globe'}
            </p>
            {this.state.errorInfo === 'WebGL Context Issue' ? (
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Reload Page
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main Component with optimizations for WebGL stability
export default function OptimizedGamingGlobe({ showCountries = true }: { showCountries?: boolean } = {}) {
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [webglError, setWebglError] = useState(false);
  const [isContextLost, setIsContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0); // Force remount canvas
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [totalPlayers, setTotalPlayers] = useState(65000); // Starting value between 40k-90k
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const isMouseOverRef = useRef(false);

  // Dynamic player count animation (40k - 90k with realistic fluctuation)
  useEffect(() => {
    const updatePlayerCount = () => {
      const time = Date.now() / 1000;

      // Multiple wave patterns for realistic fluctuation
      const baseWave = Math.sin(time * 0.05) * 0.3; // Slow base wave
      const fastWave = Math.sin(time * 0.3) * 0.1; // Faster fluctuation
      const randomWave = Math.sin(time * 0.15 + Math.sin(time * 0.08) * 2) * 0.15; // Complex wave

      // Combine waves for natural variation
      const totalVariation = baseWave + fastWave + randomWave;

      // Map to 40k-90k range
      const baseCount = 65000; // Middle point
      const range = 25000; // ±25k from base
      const newCount = Math.round(baseCount + (totalVariation * range));

      // Ensure bounds
      const clampedCount = Math.max(40000, Math.min(90000, newCount));
      setTotalPlayers(clampedCount);
    };

    const interval = setInterval(updatePlayerCount, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Load real countries from GeoJSON on component mount
  useEffect(() => {
    let isMounted = true;

    const loadCountries = async () => {
      try {
        const countryData = await loadRealCountriesFromGeoJSON();
        if (isMounted) {
          setCountries(countryData);
          setIsLoadingCountries(false);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
        if (isMounted) {
          setIsLoadingCountries(false);
        }
      }
    };

    loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate total population from countries
  const totalPopulation = useMemo(() => {
    return countries.reduce((sum: number, country: CountryData) => sum + country.population, 0);
  }, [countries]);
  // Memoize hover handler to prevent unnecessary re-renders
  const handleCountryHover = useCallback((country: CountryData | null) => {
    setHoveredCountry(country);
  }, []);

  // Memoize city click handler
  const handleCityClick = useCallback((city: CityData) => {
    setSelectedCity(city);
  }, []);

  // Memoize scene props to prevent Canvas re-creation
  const sceneProps = useMemo(() => ({
    onCountryHover: handleCountryHover,
    isMobile: isMobile,
    selectedCountry: selectedCountry,
    setSelectedCountry: setSelectedCountry,
    showCountries: showCountries,
    countries: countries,
    isLoadingCountries: isLoadingCountries,
    onCityClick: handleCityClick,
    selectedCity: selectedCity,
    isMouseOverRef: isMouseOverRef,
  }), [handleCountryHover, handleCityClick, isMobile, selectedCountry, selectedCity, showCountries, countries, isLoadingCountries]);

  // Memoize camera settings to prevent re-creation - Mobile Responsive
  const cameraSettings = useMemo(() => ({
    position: [0, 0, isMobile ? 24 : 15] as [number, number, number], // 80% zoom out on mobile (24 vs 15)
    fov: 50
  }), [isMobile]);

  // Enhanced GL settings with context loss handling
  const glSettings = useMemo(() => ({
    antialias: false,
    alpha: true,
    powerPreference: "default" as const, // Changed from low-power for better stability
    preserveDrawingBuffer: true, // Enable for context recovery
    failIfMajorPerformanceCaveat: false,
    stencil: false,
    depth: true,
    premultipliedAlpha: true
  }), []);
  // WebGL Context Loss/Restore Handler with Canvas Remount
  React.useEffect(() => {
    const handleContextLost = (event: Event) => {
      console.warn('WebGL context lost, preventing default and remounting...');
      event.preventDefault();
      setIsContextLost(true);

      // Force canvas remount after a delay
      setTimeout(() => {
        setCanvasKey(prev => prev + 1);
        setIsContextLost(false);
        setWebglError(false);
      }, 1500);
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      // Don't immediately reset states, let the timeout handle it
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);

      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }
  }, [canvasKey]); // Re-attach listeners when canvas remounts

  // Error recovery mechanism
  const handleWebGLError = useCallback(() => {
    setWebglError(true);
    // Attempt to recover after a short delay
    setTimeout(() => {
      setWebglError(false);
      setIsContextLost(false);
    }, 2000);
  }, []);

  // Cleanup and error recovery
  React.useEffect(() => {
    return () => {
      // Safe cleanup on component unmount
      try {
        if (canvasRef.current) {
          const gl = canvasRef.current.getContext('webgl2') || canvasRef.current.getContext('webgl');
          if (gl && !gl.isContextLost()) {
            // Only attempt cleanup if context is not already lost
            const loseContext = gl.getExtension('WEBGL_lose_context');
            if (loseContext) {
              setTimeout(() => {
                try {
                  loseContext.loseContext();
                } catch (e) {
                  console.warn('Context cleanup warning:', e);
                }
              }, 100);
            }
          }
        }
      } catch (error) {
        console.warn('WebGL cleanup warning:', error);
      }
    };
  }, []);

  return (
    <WebGLErrorBoundary>
      <div
        className="relative w-full h-[800px] bg-transparent"
      >
        {/* Loading Countries Overlay */}
        {isLoadingCountries && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="text-center">
              <div className="text-blue-400 text-lg mb-4">🌍 Loading Countries...</div>
              <p className="text-white text-sm mb-2 sm:mb-3">Loading world countries from GeoJSON</p>
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </div>
        )}

        {/* WebGL Context Lost Overlay */}
        {isContextLost && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-yellow-400 text-lg mb-4">⚠️ Context Restoring...</div>
              <p className="text-white text-sm mb-2 sm:mb-3">WebGL context is being restored</p>
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </div>
        )}

        {!webglError && !isContextLost ? (
          <Canvas
            ref={canvasRef}
            key={canvasKey}
            camera={cameraSettings}
            gl={glSettings}
            dpr={[1, 1.5]} // Slightly increased for better quality
            performance={{ min: 0.5 }} // Increased performance threshold
            frameloop="always" // Changed back to always for smoother experience
            onError={handleWebGLError}
            onCreated={({ gl }) => {
              // Add context loss simulation for testing (remove in production)
              // const ext = gl.getExtension('WEBGL_lose_context');
              // setTimeout(() => ext?.loseContext(), 5000);
            }}          >
            <Scene {...sceneProps} />
          </Canvas>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-4">⚠️ WebGL Error</div>
              <p className="text-white text-sm mb-4">Graphics context encountered an issue</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}      {/* Stats Panel - Gaming Network Style */}
        <div className={`absolute transition-all duration-200 bg-black/80 backdrop-blur-lg rounded-xl border border-purple-500/40 shadow-xl 
        ${isMobile
            ? 'top-2 left-2 right-2 p-3'
            : 'top-3 left-3 p-4 rounded-xl max-w-[280px]'
          }`}
          style={{ touchAction: 'pan-y', boxShadow: '0 4px 30px rgba(123, 31, 162, 0.15)' }}>

          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">noob.gg Gaming Network</span>
          </div>

          {/* Stats Grid */}
          <div className="space-y-3">          {/* Total Players */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">Total Players:</span>
              </div>
              <span className="text-blue-400 font-bold text-lg">
                {totalPlayers.toLocaleString()}
              </span>
            </div>

            {/* Active Hubs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">Active Hubs:</span>
              </div>
              <span className="text-purple-400 font-bold text-lg">{MAJOR_CITIES.length}</span>
            </div>

            {/* Connections */}          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">Connections:</span>
              </div>
              <span className="text-green-400 font-bold text-lg">Live</span>
            </div>
          </div>
        </div>{/* Country Info Panel - Modern Glassmorphism */}
        {hoveredCountry && !selectedCountry && (
          <div className="absolute bottom-20 left-4 right-4 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 bg-black/75 backdrop-blur-xl text-white rounded-xl p-3.5 sm:p-4 border border-purple-500/50 sm:w-80 sm:max-w-sm"
            style={{ touchAction: 'pan-y', boxShadow: '0 8px 32px rgba(123, 31, 162, 0.25)' }}>
            <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
              <div className="text-xl sm:text-2xl drop-shadow-glow">🌍</div>
              <div>
                <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {hoveredCountry.name === 'United States of America' ||
                    hoveredCountry.name === 'United States' ||
                    hoveredCountry.name === 'USA' ? 'USA' : hoveredCountry.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: hoveredCountry.color, boxShadow: `0 0 5px ${hoveredCountry.color}` }}
                  ></div>
                  <span className="text-xs text-gray-300">{hoveredCountry.continent}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <div className="bg-gradient-to-r from-purple-500/20 to-fuchsia-500/10 rounded-lg p-2.5 border border-purple-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Users className="w-3 h-3 text-purple-300" />
                    <span className="hidden sm:inline">Population</span>
                    <span className="sm:hidden">Pop.</span>
                  </span>
                  <span className="bg-gradient-to-br from-purple-400 to-fuchsia-500 bg-clip-text text-transparent font-bold text-sm sm:text-base">
                    {(hoveredCountry.population / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-500/20">
                <p className="text-gray-300 text-xs leading-relaxed flex items-start gap-1.5">
                  <Globe className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-300" />
                  Hover over countries for quick info, click for details!
                </p>
              </div>
            </div>
          </div>
        )}      {/* Selected Country Modal - Full Details */}
        {selectedCountry && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCountry(null)}
          >
            <div
              className="bg-black/90 backdrop-blur-xl text-white rounded-2xl p-6 border border-purple-500/50 w-full max-w-md sm:max-w-lg"
              style={{ boxShadow: '0 20px 40px rgba(123, 31, 162, 0.4)' }}
              onClick={(e) => e.stopPropagation()}
            >

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl drop-shadow-glow">🌍</div>
                  <div>                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {selectedCountry.name === 'United States of America' ||
                      selectedCountry.name === 'United States' ||
                      selectedCountry.name === 'USA' ? 'USA' : selectedCountry.name}
                  </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedCountry.color, boxShadow: `0 0 8px ${selectedCountry.color}` }}
                      ></div>
                      <span className="text-sm text-gray-300">{selectedCountry.continent}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-300" />
                    <span className="text-sm text-gray-300">Population</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-br from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
                    {(selectedCountry.population / 1000000).toFixed(1)}M
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-blue-300" />
                    <span className="text-sm text-gray-300">Continent</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                    {selectedCountry.continent}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-fuchsia-600 transition-all transform hover:scale-105"
                  style={{ boxShadow: '0 4px 15px rgba(123, 31, 162, 0.3)' }}
                >
                  Explore
                </button>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="px-4 py-3 border border-gray-500 text-gray-300 font-semibold rounded-lg hover:bg-white/10 hover:border-gray-400 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected City Modal - Gaming Hub Details */}
        {selectedCity && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCity(null)}
          >
            <div
              className="bg-black/90 backdrop-blur-xl text-white rounded-2xl p-6 border border-purple-500/50 w-full max-w-md sm:max-w-lg"
              style={{ boxShadow: '0 20px 40px rgba(123, 31, 162, 0.4)' }}
              onClick={(e) => e.stopPropagation()}
            >

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl drop-shadow-glow">🎮</div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {selectedCity.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-purple-300 font-medium">Gaming Hub</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCity(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-300" />
                    <span className="text-sm text-gray-300">Active Players</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-br from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
                    {Math.floor(selectedCity.population / 100)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 className="w-5 h-5 text-blue-300" />
                    <span className="text-sm text-gray-300">Popular Games</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                    3
                  </div>
                </div>
              </div>

              {/* Popular Games List */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Gamepad2 className="w-4 h-4 text-purple-300" />
                  <span className="text-sm text-gray-300 font-medium">Popular Games</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg border border-purple-500/20">
                    <span className="text-white font-medium">CS2</span>
                    <span className="text-purple-300 text-sm font-bold">#1</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg border border-blue-500/20">
                    <span className="text-white font-medium">LOL</span>
                    <span className="text-blue-300 text-sm font-bold">#2</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg border border-green-500/20">
                    <span className="text-white font-medium">Valorant</span>
                    <span className="text-green-300 text-sm font-bold">#3</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCity(null)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-fuchsia-600 transition-all transform hover:scale-105"
                  style={{ boxShadow: '0 4px 15px rgba(123, 31, 162, 0.3)' }}
                >
                  Join Hub
                </button>
                <button
                  onClick={() => setSelectedCity(null)}
                  className="px-4 py-3 border border-gray-500 text-gray-300 font-semibold rounded-lg hover:bg-white/10 hover:border-gray-400 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls - Modern Glassmorphism */}
        <div className="absolute bottom-16 sm:bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-xl rounded-full px-4 py-2 sm:px-6 sm:py-2.5 border border-purple-500/30 shadow-lg"
          style={{ touchAction: 'pan-y', boxShadow: '0 4px 20px rgba(123, 31, 162, 0.2)' }}>
          <p className="text-gray-200 text-xs sm:textsm text-center flex items-center justify-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5">
              <Mouse className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-purple-300" />
              <span className="hidden sm:inline">Drag to rotate</span>
              <span className="sm:hidden">Drag</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-blue-300" />
              <span className="hidden sm:inline">Scroll to zoom</span>
              <span className="sm:hidden">Zoom</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-green-300" />
              <span className="hidden sm:inline">Click hubs for info</span>
              <span className="sm:hidden">Click</span>
            </span>
          </p>
        </div>

        {/* WebGL Status Indicator - Modern Pill */}
        <div
          className={`absolute bottom-4 
            ${isMobile
              ? 'left-1/2 transform -translate-x-1/2'
              : 'right-4 left-auto transform-none'
            } flex items-center gap-2 bg-black/60 backdrop-blur-xl rounded-full px-3 py-1.5 sm:px-3.5 sm:py-1.5 border border-purple-500/30 shadow-md z-30`}
          style={{ touchAction: 'pan-y', boxShadow: '0 4px 12px rgba(123, 31, 162, 0.15)' }}
        >
          <div className={`w-2 h-2 rounded-full 
          ${isContextLost
              ? 'bg-yellow-400'
              : webglError
                ? 'bg-red-400'
                : 'bg-emerald-400'
            }`} style={{
              boxShadow: isContextLost
                ? '0 0 5px #facc15'
                : webglError
                  ? '0 0 5px #f87171'
                  : '0 0 5px #34d399'
            }}></div>
          <span className={`text-xs font-medium 
          ${isContextLost
              ? 'text-yellow-400'
              : webglError
                ? 'text-red-400'
                : 'bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent'
            }`}>
            {isContextLost ? 'Restoring...' : webglError ? 'Error' : 'WebGL Active'}
          </span>
        </div>
      </div>
    </WebGLErrorBoundary>
  );
}