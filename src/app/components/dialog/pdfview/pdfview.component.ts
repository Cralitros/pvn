import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { DocenteApiService } from '../../../core/api';

@Component({
  selector: 'app-pdfview',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './pdfview.component.html',
  styleUrl: './pdfview.component.scss'
})
export class PdfviewComponent {

  pdfSrc: any;
  private subscription: Subscription | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private readonly docenteApi: DocenteApiService,
    private sanitizer: DomSanitizer) {
  }

  ngAfterViewInit() {
    // Set the PDF source after the view is initialized
    this.loadPdf();
  }

  /**
   * Carga en el visor el PDF del contrato del docente.
   *
   * La URL ya no se arma a mano contra `environment`: la construye
   * `DocenteApiService`, que es el único punto que conoce las rutas de la API.
   */
  loadPdf() {
    const codigo = this.data?.persona?.codigo;
    const dni = localStorage.getItem('dni');

    if (!codigo || !dni) {
      console.error('No se pudo cargar el contrato: falta el código del docente o el DNI en sesión.');
      return;
    }

    this.subscription = this.docenteApi.descargarContrato(codigo, dni).subscribe({
      next: (blob: Blob) => {
        const blobUrl = URL.createObjectURL(blob);
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      },
      error: (err: unknown) => {
        console.error('Error al cargar el PDF:', err);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // Liberar la URL del Blob para evitar memory leaks
    if (this.pdfSrc) {
      URL.revokeObjectURL(this.pdfSrc as string);
    }
  }

  /**********WORD */
  generarContratoDocx() {
    const codigo = this.data?.persona?.codigo;

    if (!codigo) {
      console.error('No se pudo generar el contrato: falta el código del docente.');
      return;
    }

    this.docenteApi.descargarContratoWord(codigo).subscribe({
      next: (blob: Blob) => {
        saveAs(blob, `contrato_docente_${codigo}.docx`);
        alert('El archivo ha sido descargado. Ábrelo desde tu carpeta de descargas.');
      },
      error: (err: unknown) => {
        console.error('Error al generar el contrato en Word:', err);
      }
    });
  }

}
