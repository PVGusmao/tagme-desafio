import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { Item } from '../item.model';
import { ItemService } from '../item.service';
import { ImageService } from '../../shared/image.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-create-item-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageCropperComponent],
  template: `
    <div class="fixed inset-0 h-full z-50 flex items-center justify-center bg-black bg-opacity-50" (click)="onCancel()">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-[20%] p-6" (click)="$event.stopPropagation()">
        <h2 class="text-xl font-semibold mb-4">Novo Item</h2>
        <form [formGroup]="createForm" class="flex flex-col space-y-4">
          <input formControlName="title" placeholder="Título" class="border p-2 rounded" />
          <textarea formControlName="description" placeholder="Descrição" class="border p-2 rounded"></textarea>

          <input type="file" accept="image/*" (change)="fileChangeEvent($event)" class="border p-2 rounded" />

          <image-cropper
            *ngIf="imageChangedEvent"
            class="w-full max-h-64"
            [imageChangedEvent]="imageChangedEvent"
            [maintainAspectRatio]="false"
            [resizeToWidth]="256"
            format="png"
            [output]="'base64'"
            (imageCropped)="imageCropped($event)"></image-cropper>

          <div class="flex justify-end space-x-2">
            <button type="button" (click)="onCancel()" class="px-4 py-2 border rounded">Cancelar</button>
            <button type="button" (click)="onCreate()" class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60" [disabled]="createForm.invalid">Criar</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateItemModalComponent {
  @Output() created = new EventEmitter<Item>();
  @Output() cancel = new EventEmitter<void>();

  imageChangedEvent: any = '';
  croppedImage: SafeUrl | null = null;

  createForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private itemService: ItemService, private imageService: ImageService) {}

  onCancel() {
    this.resetState();
    this.cancel.emit();
  }

  onCreate() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const newItem: Item = this.createForm.value as Item;

    this.itemService.create(newItem).subscribe({
      next: (resp) => {
        this.resetState();
        this.created.emit(resp);
      },
      error: () => alert('Ocorreu um erro ao criar o item.')
    });
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

  private resetState() {
    this.imageChangedEvent = '';
    this.croppedImage = null;
    this.createForm.reset();
  }
} 