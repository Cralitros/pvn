import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-firma',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './firma.component.html',
  styleUrl: './firma.component.scss'
})
export class FirmaComponent {
  @ViewChild('canvas', { static: true }) canvasEl!: ElementRef<HTMLCanvasElement>;
  private signaturePad!: SignaturePad;

  signatureImg: string = '';
  fileName: string = '';

  ngAfterViewInit(): void {
    const canvas = this.canvasEl.nativeElement;

    // aseguramos tamaño visible
    canvas.width = 500;
    canvas.height = 300;

    // inicializamos signature pad
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255,255,255)', // fondo blanco
      penColor: 'black',
      minWidth: 1,
      maxWidth: 3
    });
  }

  clear() {
    this.signaturePad.clear();
    this.signatureImg = '';
  }

  save() {
    if (!this.signaturePad.isEmpty()) {
      this.signatureImg = this.signaturePad.toDataURL('image/png'); // genera base64
    } else {
      alert('Por favor dibuja una firma antes de guardar.');
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.signatureImg = e.target.result;  // ahora se carga la imagen
        console.log("Imagen cargada:", this.signatureImg); // debug
      };

      reader.readAsDataURL(file); // convierte a Base64
    }
  }
}
