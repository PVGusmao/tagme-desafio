import { Component } from '@angular/core';
import { ItemService } from '../item.service';
import { Item } from '../item.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss'
})
export class ItemListComponent {
  items: Item[] = [];
  itemToDelete: Item | null = null;

  constructor(private itemService: ItemService, private router: Router) {
    this.loadItems();
  }

  loadItems() {
    this.itemService.getItems().subscribe((data) => (this.items = data));
  }

  editItem(item: Item) {
    this.router.navigate(['/items/edit', item.id]);
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
}
