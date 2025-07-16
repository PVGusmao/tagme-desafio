import { Component, EventEmitter, Input, OnChanges, SimpleChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { Item } from '../../items/item.model';
import { ItemService } from '../../items/item.service';
import { ImageService } from '../../shared/image.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-item-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: './edit-item-modal.component.html'
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