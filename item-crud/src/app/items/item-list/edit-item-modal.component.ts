import { Component, EventEmitter, Input, OnChanges, SimpleChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { Item } from '../item.model';
import { ItemService } from '../item.service';
import { ImageService } from '../../shared/image.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-item-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageCropperComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" (click)="onCancel()">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-[28rem] p-6" (click)="$event.stopPropagation()">
        <h2 class="text-xl font-semibold mb-4">Editar item</h2>
        <form [formGroup]="editForm" class="flex flex-col space-y-4">
          <input formControlName="title" placeholder="Título" class="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea formControlName="description" placeholder="Descrição" class="border p-2 rounded h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>

          <input type="file" accept="image/*" (change)="fileChangeEvent($event)" class="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />

          <image-cropper
            *ngIf="imageChangedEvent"
            class="w-full max-h-64"
            [imageChangedEvent]="imageChangedEvent"
            [maintainAspectRatio]="false"
            [resizeToWidth]="256"
            format="png"
            [output]="'base64'"
            (imageCropped)="imageCropped($event)"></image-cropper>

          <div class="flex justify-end space-x-2 pt-2">
            <button type="button" (click)="onCancel()" class="px-4 py-2 border rounded hover:bg-gray-100">Cancelar</button>
            <button type="button" (click)="onSave()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-60" [disabled]="editForm.invalid">Aplicar</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EditItemModalComponent implements OnChanges {
  @Input() item: Item | null = null;
  @Output() updated = new EventEmitter<Item>();
  @Output() cancel = new EventEmitter<void>();

  imageChangedEvent: any = '';
  croppedImage: SafeUrl | null = null;

  editForm = this.fb.group({
    id: [null as number | null],
    title: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private itemService: ItemService, private imageService: ImageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.editForm.patchValue(this.item);
      this.clearImage();
    }
  }

  onCancel() {
    this.clearImage();
    this.cancel.emit();
  }

  onSave() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const updatedItem: Item = this.editForm.value as Item;

    this.itemService.update(updatedItem).subscribe({
      next: (resp) => {
        this.clearImage();
        this.updated.emit(resp);
      },
      error: () => alert('Ocorreu um erro ao atualizar o item.')
    });
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;

    const file: File | undefined = event?.target?.files?.[0];
    if (file) {
      this.imageService.fileToDataUrl(file).then((url) => this.editForm.get('imageUrl')?.setValue(url));
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    const url = event.base64 ?? event.objectUrl ?? '';
    this.croppedImage = this.imageService.sanitize(url);
    this.editForm.get('imageUrl')?.setValue(url);
  }

  private clearImage() {
    this.imageChangedEvent = '';
    this.croppedImage = null;
  }
} 