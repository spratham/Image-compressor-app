import { Component } from '@angular/core';
import { CompressionService } from './compression.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  selectedFile: File | null = null;
  compressedFile: File | null = null;
  originalSize: string = '';
  compressedSize: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private compressionService: CompressionService) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validating file type and size (max 6MB)
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please upload an image file (JPEG, PNG, etc.)';
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      this.errorMessage = 'File exceeds 5MB limit';
      return;
    }

    this.selectedFile = file;
    this.originalSize = this.formatFileSize(file.size);
    this.errorMessage = '';
    this.compressedFile = null;
  }

  async compressImage() {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.compressedFile = await this.compressionService.compressImage(this.selectedFile);
      this.compressedSize = this.formatFileSize(this.compressedFile.size);
    } catch (error) {
      this.errorMessage = 'Failed to compress image. Try again.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  downloadCompressedImage() {
    if (!this.compressedFile) return;

    const url = URL.createObjectURL(this.compressedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.compressedFile.name;
    link.click();
    URL.revokeObjectURL(url); // Free memory
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }
}
