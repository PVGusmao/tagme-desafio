import { Component } from '@angular/core';
import { ItemService } from '../item.service';
import { Item } from '../item.model';
// Navegação por rota não é mais necessária para edição em modal
// Router não é mais necessário aqui, pois criação e edição são modais locais
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { CommonModule } from '@angular/common';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss'
})
export class ItemListComponent {
  items: Item[] = [];
  itemToDelete: Item | null = null;
  itemToEdit: Item | null = null;
  isCreateModalOpen = false;

  // Dados para recorte da imagem
  imageChangedEvent: any = '';
  croppedImage: SafeUrl | null = null;

  // Variáveis dedicadas ao recorte de imagem no modo de edição
  imageChangedEventEdit: any = '';
  croppedImageEdit: SafeUrl | null = null;

  // Formulário reativo para edição
  editForm = this.fb.group({
    id: [null as number | null],
    title: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: ['', Validators.required],
  });

  createForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: ['', Validators.required],
  });

  constructor(
    private itemService: ItemService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.loadItems();
  }

  loadItems() {
    this.itemService.getItems().subscribe((data) => (this.items = data));
  }

  // ------------- MÉTODOS DE EDIÇÃO -------------
  editItem(item: Item) {
    this.itemToEdit = item;
    this.editForm.patchValue(item);

    // Reseta dados de recorte para o fluxo de edição
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
        // Remove o item do array local para refletir imediatamente na UI
        this.items = this.items.filter((i) => i.id !== id);
        this.itemToDelete = null;
      },
      error: () => {
        alert('Ocorreu um erro ao excluir o item.');
      }
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
        // Atualiza item localmente
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

  // Métodos para recorte de imagem
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;

    // Garante que o campo imageUrl receba um valor para que o formulário fique válido
    const file: File | undefined = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.createForm.get('imageUrl')?.setValue(result);
      };
      reader.readAsDataURL(file);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    // Para versões 9+ usa objectUrl
    const url = event.base64 ?? event.objectUrl ?? '';
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(url);
    this.createForm.get('imageUrl')?.setValue(url);
  }

  clearImage() {
    this.imageChangedEvent = '';
    this.croppedImage = null;
    this.createForm.get('imageUrl')?.setValue('');
  }

  // ---------------- MÉTODOS PARA RECORTE DE IMAGEM NA EDIÇÃO ----------------

  fileChangeEventEdit(event: any): void {
    this.imageChangedEventEdit = event;

    const file: File | undefined = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.editForm.get('imageUrl')?.setValue(result);
      };
      reader.readAsDataURL(file);
    }
  }

  imageCroppedEdit(event: ImageCroppedEvent) {
    const url = event.base64 ?? event.objectUrl ?? '';
    this.croppedImageEdit = this.sanitizer.bypassSecurityTrustUrl(url);
    this.editForm.get('imageUrl')?.setValue(url);
  }

  clearImageEdit() {
    this.imageChangedEventEdit = '';
    this.croppedImageEdit = null;
  }
}
