import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import SignaturePad from 'signature_pad';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';

import { MatRadioModule } from '@angular/material/radio';
@Component({
  selector: 'app-firmasdlg',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatRadioModule
  ],
  templateUrl: './firmasdlg.component.html',
  styleUrl: './firmasdlg.component.scss'
})
export class FirmasdlgComponent {
  @ViewChild('canvas') canvasEl?: ElementRef<HTMLCanvasElement>;
  private signaturePad?: SignaturePad;

  signatureImg: string = '';
  fileName: string = '';

  form: FormGroup;
  constructor(public dialogRef: MatDialogRef<FirmasdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService) {
    console.log("firma");

    console.log(data);
    this.form = this.formBuilder.group({
      tipoFirma: ['1']  // valor por defecto -> Firma manual
    });


  }
  ngAfterViewInit(): void {
      // Reaccionar a los cambios en el tipo de firma
    this.form.get('tipoFirma')?.valueChanges.subscribe(value => {
      if (value === '1') {
        // Espera a que Angular renderice el canvas nuevamente
        setTimeout(() => this.initSignaturePad(), 0);
      } else {
        this.destroySignaturePad();
      }
    });

    // Inicializar si arranca en "Firma manual"
    if (this.form.get('tipoFirma')?.value === '1') {
      setTimeout(() => this.initSignaturePad(), 0);
    }
  }
  private initSignaturePad(): void {
    if (!this.canvasEl) return;

    const canvas = this.canvasEl.nativeElement;
    canvas.width = 500;
    canvas.height = 300;

    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: '#fff',
      penColor: 'black',
      minWidth: 1,
      maxWidth: 3
    });
  }

  private destroySignaturePad(): void {
    if (this.signaturePad) {
      this.signaturePad.off(); // limpia listeners
      this.signaturePad = undefined;
    }
  }

  clear() {
    this.signaturePad?.clear();
    this.signatureImg = '';
  }

  save() {
     if (this.signaturePad && !this.signaturePad.isEmpty()) {
      this.signatureImg = this.signaturePad.toDataURL('image/png');
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
