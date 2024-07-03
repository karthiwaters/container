import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-three-d-container',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './three-d-container.component.html',
  styleUrl: './three-d-container.component.scss'
})
export class ThreeDContainerComponent implements AfterViewInit {
  @ViewChild('container') containerRef!: ElementRef;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  containerMesh!: THREE.LineSegments;
  door1Mesh!: THREE.LineSegments;
  door2Mesh!: THREE.LineSegments;
  bottomMesh!: THREE.Mesh;
  itemsGroup!: THREE.Group;

  length: number = 6.1; // meters (20ft)
  width: number = 2.44; // meters (8ft)
  height: number = 2.59; // meters (8.5ft)
  color: string = '#000000'; // Container line color
  doorColor: string = '#000000'; // Door line color
  bottomColor: string = '#0000ff'; // Bottom grid color
  bottomOpacity: number = 0.2; // Adjust opacity as needed
  itemWidth: number = 1.0; // meters
  itemHeight: number = 0.5; // meters
  numItems: number = 10; // Number of items to generate

  ngAfterViewInit(): void {
    this.initThreeJs();
  }

  private initThreeJs(): void {
    this.scene = new THREE.Scene();

    const aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setClearColor(0x000000, 0); // Set background color to transparent
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.containerRef.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', () => this.renderScene()); // Only render on interaction

    this.createContainer();
    this.createDoors();
    this.createBottomLayer();
    this.createItems();
    this.renderScene(); // Initial render
  }

  private createContainer(): void {
    if (this.containerMesh) {
      this.scene.remove(this.containerMesh);
    }

    const geometry = new THREE.BoxGeometry(this.length, this.height, this.width);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: this.color });
    this.containerMesh = new THREE.LineSegments(edges, material);
    this.scene.add(this.containerMesh);
    this.renderScene();
  }

  private createDoors(): void {
    const doorThickness = 0.001; // Adjust as needed
    const doorHeight = this.height;
    const doorWidth = this.width / 2; // Half the width of the container for each door

    // Door 1 (left) - Open position
    if (this.door1Mesh) {
      this.scene.remove(this.door1Mesh);
    }
    const door1Geometry = new THREE.BoxGeometry(doorThickness, doorHeight, doorWidth);
    const material = new THREE.LineBasicMaterial({ color: this.doorColor });
    this.door1Mesh = new THREE.LineSegments(door1Geometry, material);

    this.door1Mesh.position.set(this.length / 2 - doorThickness + 0.8 / 2, 0, -this.width/3); // Adjusted position
    this.door1Mesh.rotation.y = Math.PI / 4.3; // Initial position is closed
    this.scene.add(this.door1Mesh);

    // Door 2 (right) - Open position
    if (this.door2Mesh) {
      this.scene.remove(this.door2Mesh);
    }
    const door2Geometry = new THREE.BoxGeometry(doorThickness, doorHeight, doorWidth);
    const door2Material = new THREE.LineBasicMaterial({ color: this.doorColor });
    this.door2Mesh = new THREE.LineSegments(door2Geometry, door2Material);
    this.door2Mesh.position.set(this.length / 2 - doorThickness + 0.8 / 2, 0, this.width / 3); // Adjusted position
    this.door2Mesh.rotation.y = -Math.PI / 4.3; // Initial position is closed
    this.scene.add(this.door2Mesh);

    this.renderScene();
  }

  private createBottomLayer(): void {
    if (this.bottomMesh) {
      this.scene.remove(this.bottomMesh);
    }

    const bottomGeometry = new THREE.PlaneGeometry(this.length, this.width, 15, 10); // Adding segments for grid
    const bottomMaterial = new THREE.MeshBasicMaterial({ color: this.bottomColor, transparent: true, opacity: this.bottomOpacity, wireframe: true });
    this.bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
    this.bottomMesh.position.set(0, -this.height / 2, 0);
    this.bottomMesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.bottomMesh);

    this.renderScene();
  }

  private createItems(): void {
    if (this.itemsGroup) {
      this.scene.remove(this.itemsGroup);
    }

    this.itemsGroup = new THREE.Group();

    const itemGeometry = new THREE.BoxGeometry(this.itemWidth, this.itemHeight, this.itemWidth);
    const itemMaterial = new THREE.MeshBasicMaterial({ color: '#ff0000' }); // Item color

    // Start position for items at one side of the container
    const startX = -this.length / 2 + this.itemWidth / 2;
    const startZ = -this.width / 2 + this.itemWidth / 2;

    const gap = 0.1; // Gap between items
    let currentY = -this.height / 2 + this.itemHeight / 2; // Start at bottom + half of item height
    let currentX = startX; // Start X position

    for (let i = 0; i < this.numItems; i++) {
      const item = new THREE.Mesh(itemGeometry, itemMaterial);

      // Set item position
      item.position.set(currentX, currentY, startZ);

      // Increment Y position for next item
      currentY += this.itemHeight + gap;

      // If Y position exceeds container height, reset Y and move X
      if (currentY + this.itemHeight / 2 > this.height / 2) {
        currentY = -this.height / 2 + this.itemHeight / 2;
        currentX += this.itemWidth + gap;
      }

      this.itemsGroup.add(item);
    }

    this.scene.add(this.itemsGroup);
    this.renderScene();
  }

  onSubmit(): void {
    this.createContainer();
    this.createDoors();
    this.createBottomLayer();
    this.createItems();
  }

  private renderScene(): void {
    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    const aspectRatio = this.getAspectRatio();
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderScene();
  }

  private getAspectRatio(): number {
    return window.innerWidth / window.innerHeight;
  }
}
