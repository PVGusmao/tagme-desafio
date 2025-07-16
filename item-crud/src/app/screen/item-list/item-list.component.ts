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
    this.itemService.getItems().subscribe((data) => (this.items = data));
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
    this.items.push(item);
    this.isCreateModalOpen = false;
  }

  onItemUpdated(item: Item) {
    const idx = this.items.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      this.items[idx] = item;
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
} 