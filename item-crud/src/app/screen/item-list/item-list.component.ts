import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { SafeUrl } from '@angular/platform-browser';

import { Item } from '../../items/item.model';
import { ItemService } from '../../items/item.service';
import { ImageService } from '../../shared/image.service';

import { ConfirmDeleteModalComponent } from '../../components/confirm-delete-modal/confirm-delete-modal.component';
import { EditItemModalComponent } from '../../components/edit-item-modal/edit-item-modal.component';
import { CreateItemModalComponent } from '../../components/create-item-modal/create-item-modal.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageCropperComponent,
    ConfirmDeleteModalComponent,
    EditItemModalComponent,
    CreateItemModalComponent
  ],
  templateUrl: './item-list.component.html',
})
export class ItemListComponent {
  items: Item[] = [];
  hoveredItem: Item | null = null;
  itemToDelete: Item | null = null;
  itemToEdit: Item | null = null;
  isCreateModalOpen = false;

  imageChangedEvent: any = '';
  croppedImage: SafeUrl | null = null;

  imageChangedEventEdit: any = '';
  croppedImageEdit: SafeUrl | null = null;

  editForm = this.fb.group({
    id: [null as number | null],
    title: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: ['', Validators.required]
  });

  createForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: ['', Validators.required]
  });

  isDarkMode = false;

  constructor(
    private itemService: ItemService,
    private fb: FormBuilder,
    private imageService: ImageService
  ) {
    this.loadItems();
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  loadItems() {
    this.itemService.getItems().subscribe((data) => {
      // Adiciona rotação randômica para cada item (efeito de fotos espalhadas)
      this.items = data.map((item) => ({
        ...item,
        // rotação entre -10º e 10º (exceto 0)
        rotation: this.randomRotation(),
        offsetX: this.randomOffset(),
        offsetY: this.randomOffset()
      })) as any;
    });
  }

  editItem(item: Item) {
    this.itemToEdit = item;
    this.editForm.patchValue(item);
    this.clearImageEdit();
  }

  deleteItem(item: Item) {
    this.itemToDelete = item;
  }

  confirmDelete() {
    if (!this.itemToDelete) {
      return;
    }

    const id = this.itemToDelete.id!;

    this.itemService.delete(id).subscribe({
      next: () => {
        this.items = this.items.filter((i) => i.id !== id);
        this.itemToDelete = null;
      },
      error: () => alert('Ocorreu um erro ao excluir o item.')
    });
  }

  cancelDelete() {
    this.itemToDelete = null;
  }

  applyEdit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const updatedItem: Item = this.editForm.value as Item;

    this.itemService.update(updatedItem).subscribe({
      next: (resp) => {
        const idx = this.items.findIndex((i) => i.id === resp.id);
        if (idx !== -1) {
          this.items[idx] = resp;
        }
        this.itemToEdit = null;
      },
      error: () => alert('Ocorreu um erro ao atualizar o item.')
    });
  }

  cancelEdit() {
    this.clearImageEdit();
    this.itemToEdit = null;
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
    this.createForm.reset();
    this.clearImage();
  }

  createItem() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const newItem: Item = this.createForm.value as Item;

    this.itemService.create(newItem).subscribe({
      next: (resp) => {
        this.items.push(resp);
        this.isCreateModalOpen = false;
      },
      error: () => alert('Ocorreu um erro ao criar o item.')
    });
  }

  cancelCreate() {
    this.isCreateModalOpen = false;
  }

  onItemCreated(item: Item) {
    this.items.push({ ...(item as any), rotation: this.randomRotation(), offsetX: this.randomOffset(), offsetY: this.randomOffset() } as any);
    this.isCreateModalOpen = false;
  }

  onItemUpdated(item: Item) {
    const idx = this.items.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      // mantém rotação antiga ou aplica nova se não houver
      const old = this.items[idx] as any;
      this.items[idx] = {
        ...(item as any),
        rotation: old.rotation ?? this.randomRotation(),
        offsetX: old.offsetX ?? this.randomOffset(),
        offsetY: old.offsetY ?? this.randomOffset()
      } as any;
    }
    this.itemToEdit = null;
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;

    const file: File | undefined = event?.target?.files?.[0];
    if (file) {
      this.imageService.fileToDataUrl(file).then((url) => this.createForm.get('imageUrl')?.setValue(url));
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    const url = event.base64 ?? event.objectUrl ?? '';
    this.croppedImage = this.imageService.sanitize(url);
    this.createForm.get('imageUrl')?.setValue(url);
  }

  clearImage() {
    this.imageChangedEvent = '';
    this.croppedImage = null;
    this.createForm.get('imageUrl')?.setValue('');
  }

  fileChangeEventEdit(event: any): void {
    this.imageChangedEventEdit = event;

    const file: File | undefined = event?.target?.files?.[0];
    if (file) {
      this.imageService.fileToDataUrl(file).then((url) => this.editForm.get('imageUrl')?.setValue(url));
    }
  }

  imageCroppedEdit(event: ImageCroppedEvent) {
    const url = event.base64 ?? event.objectUrl ?? '';
    this.croppedImageEdit = this.imageService.sanitize(url);
    this.editForm.get('imageUrl')?.setValue(url);
  }

  clearImageEdit() {
    this.imageChangedEventEdit = '';
    this.croppedImageEdit = null;
  }

  private randomRotation(): number {
    let deg = 0;
    while (deg === 0) {
      deg = Math.floor(Math.random() * 21) - 10; // -10 .. 10
    }
    return deg;
  }

  private randomOffset(): number {
    return Math.floor(Math.random() * 81) - 40; // -40 .. 40 px
  }

  getCardStyle(item: any) {
    const isHovered = this.hoveredItem === item;
    const someoneHovered = !!this.hoveredItem;
    const rotation = item.rotation ?? 0;
    const offsetX = item.offsetX ?? 0;
    const offsetY = item.offsetY ?? 0;

    return {
      transform: isHovered
        ? 'rotate(0deg) translate(0, 0) scale(1.25)'
        : `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(0.85)`,
      zIndex: isHovered ? 30 : 5,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease',
      boxShadow: isHovered ? '0 15px 30px rgba(0,0,0,0.35)' : '0 2px 6px rgba(0,0,0,0.1)',
      filter: someoneHovered && !isHovered ? 'brightness(0.5)' : 'none'
    } as any;
  }
} 