import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { Item } from '../../items/item.model';
import { ItemService } from '../../items/item.service';
import { ImageService } from '../../shared/image.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-create-item-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: './create-item-modal.component.html'
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