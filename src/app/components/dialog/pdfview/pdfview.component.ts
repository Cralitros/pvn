import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeUrlPipe } from './safe-url.pipe';
import { Aux1Service } from '../../../services/aux1.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pdfview',
  standalone: true,
  imports: [],
  templateUrl: './pdfview.component.html',
  styleUrl: './pdfview.component.scss'
})
export class PdfviewComponent {

  pdfSrc: SafeResourceUrl | null| undefined ;
  private subscription: Subscription | null = null;
  private apiUrl =  environment.direccion;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private saux1: Aux1Service,
    private http: HttpClient,
    private sanitizer: DomSanitizer) {
    console.log(data);
    this.saux1.ponerurl(`docentes/contrato/${data.persona.codigo}`);

  }

  ngAfterViewInit() {
    // Set the PDF source after the view is initialized
    // this.pdfSrc = this.data.pdfUrl; // Adjust based on your data structure
    this.loadPdf();
  }

  loadPdf() {
    const url = `${this.apiUrl}docentes/contrato/${this.data.persona.codigo}`; // Ajusta la URL según tu API
    console.log('Solicitando PDF para código:', this.data.codigo);

    console.log(url);
    
    /*this.http.get(url, { responseType: 'blob' })
    .subscribe((response: Blob) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });*/

   this.subscription = this.http
      .get(url, { responseType: 'blob' as const }) // 'as const' asegura el tipo literal
      .subscribe({
        next: (blob: Blob) => {
          console.log('PDF recibido como Blob:', blob);
          const blobUrl = URL.createObjectURL(blob);
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
          console.log('PDF asignado al visor:', blobUrl);
        },
        error: (err: any) => {
          console.error('Error al cargar el PDF:', err);
        },
        complete: () => {
          console.log('Carga del PDF completada');
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

}
