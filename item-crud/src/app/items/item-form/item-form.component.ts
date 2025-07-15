import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../item.service';
import { Item } from '../item.model';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss'
})
export class ItemFormComponent {
  form = this.fb.group({
    id: [],
    title: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: ['', Validators.required],
  });

  get isEdit() {
    return !!this.form.value.id;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private itemService: ItemService
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.itemService.getItem(id).subscribe((item) => this.form.patchValue(item as any));
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const item: Item = this.form.value as Item;

    const action$ = this.isEdit
      ? this.itemService.update(item)
      : (() => {
          // Deixa o backend gerar o id automaticamente
          const { id, ...itemData } = item as any;
          return this.itemService.create(itemData as Item);
        })();
    action$.subscribe({
      next: () => this.router.navigate(['/items']),
      error: () => alert('Ocorreu um erro ao salvar o item.')
    });
  }
}
