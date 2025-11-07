import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import SignaturePad from 'signature_pad';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-firmasdlg',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatRadioModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  templateUrl: './firmasdlg.component.html',
  styleUrl: './firmasdlg.component.scss'
})
export class FirmasdlgComponent {
  @ViewChild('canvas') canvasEl?: ElementRef<HTMLCanvasElement>;
  private signaturePad?: SignaturePad;

  signatureImg: string = '';   // Imagen en formato data:image/png;base64,...
  signatureText: string = '';  // Solo el texto Base64 (para BD)
  fileName: string = '';
  fileLoaded = false; // <- bandera
  value = 'Limpia e ingresa las iniciales';
  form: FormGroup;
  fnc: boolean = true;
  funcion: any;

  constructor(
    public dialogRef: MatDialogRef<FirmasdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService
  ) {
    this.form = this.formBuilder.group({
      iniciales: [],
      tipoFirma: ['1'] // Valor por defecto -> Firma manual
    });
  }

  ngOnInit() {
    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();

    } else {
      this.funcion = "Añadir"
      this.fnc = true;
    }
  }
  poner_datos() {
    console.log(this.data);

    this.form.setValue({
      iniciales: this.data.valores.iniciales || '',
      tipoFirma: '1',
      //idLogin:this.data.valores.idLogin,

    });
    this.signatureText = this.data.valores.firma;
    // 2️⃣ Si hay firma almacenada en la BD (formato Base64 sin prefijo)
    if (this.data.valores.firma) {
      // reconstruir la imagen a partir del string Base64
      this.signatureText = this.data.valores.firma;
      this.signatureImg = `data:image/png;base64,${this.data.valores.firma}`;
      console.log('Firma precargada en vista previa');
    }

    // 3️⃣ Reaccionar según tipo de firma
    const tipoFirma = this.form.get('tipoFirma')?.value;

    if (tipoFirma === '1') {
      // firma manual → inicializa el canvas
      setTimeout(() => this.initSignaturePad(), 0);
    } else {
      // firma cargada → destruye canvas si existiera
      this.destroySignaturePad();
    }
    //this.form.value.id=this.data.valores.id;
  }
  ngAfterViewInit(): void {
    this.form.get('tipoFirma')?.valueChanges.subscribe(value => {
      if (value === '1') {
        setTimeout(() => this.initSignaturePad(), 0);
      } else {
        this.destroySignaturePad();
      }
    });

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

    // 🔥 Actualizar vista previa automáticamente al finalizar un trazo
    this.signaturePad.addEventListener('endStroke', () => {
      this.updatePreview();
    });
  }
  private updatePreview(): void {
    if (!this.signaturePad) return;

    const dataUrl = this.signaturePad.toDataURL('image/png');
    this.signatureImg = dataUrl;
    this.signatureText = dataUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');

    console.log('Vista previa actualizada:', this.signatureText.substring(0, 50) + '...');
  }

  private destroySignaturePad(): void {
    if (this.signaturePad) {
      this.signaturePad.off();
      this.signaturePad = undefined;
    }
  }

  clear() {
    // reset
    this.signaturePad?.clear();
    this.signatureImg = '';
    this.signatureText = '';
    this.fileName = '';
    this.fileLoaded = false;
  }

  salvar() {
    let body = {
      id:this.data.valores.id,
      iniciales: this.form.value?.iniciales,
      firma: this.signatureText,
      idLogin: this.data.valores?.codigo?.id?this.data.valores?.codigo?.id:this.data.valores.id
    }
    console.log(body);

    this.cgdepr.ponerurl("firma")

    if (this.fnc == true) {
      this.cgdepr.add(body).subscribe(data => {
        console.log("agregado");
        Swal.fire({
          title: "Agregado",
          text: "Continuar",
          icon: "info"
        });
        this.dialogRef.close(this.form.value);
      })
    } else {
      this.cgdepr.update(body.id, body).subscribe(data => {
        console.log("actualizado");
        Swal.fire({
          title: "Actualizado",
          text: "Continuar",
          icon: "info"
        });
        this.dialogRef.close(this.form.value);
      })
    }

    this.dialogRef.close(this.form.value);

  }
  save() {
    const tipo = this.form.get('tipoFirma')?.value;

    if (tipo === '1' && this.signaturePad) {
      if (!this.signaturePad.isEmpty()) {
        this.signatureImg = this.signaturePad.toDataURL('image/png');
        this.signatureText = this.signatureImg.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
      } else {
        alert('Por favor dibuja una firma antes de guardar.');
        return;
      }
    } else if (tipo === '2') {
      // aquí comprobamos la bandera
      if (!this.fileLoaded) {
        alert('La imagen aún se está cargando. Espera un momento y vuelve a guardar.');
        return;
      }
      // si fileLoaded === true, signatureImg y signatureText ya están listos
      console.log('Firma cargada Base64:', this.signatureText);
    } else {
      alert('Por favor selecciona un tipo de firma.');
      return;
    }

    // proceder a enviar/guardar
    console.log('✅ Firma lista para guardar');
    this.salvar();
    // ej: this.dialogRef.close({ signatureText: this.signatureText, signatureImg: this.signatureImg });
  }

  imagenBase64: string | null = null;

  async onFileSelected2(event: Event): Promise<any> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        console.log('Tipo de resultado:', typeof e.target.result);
        console.log('Longitud Base64:', e.target.result.length);
        console.log('Inicio Base64:', e.target.result.substring(0, 50));

        this.signatureImg = e.target.result;
        this.signatureText = this.signatureImg.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
        this.fileLoaded = true;
      };

      reader.readAsDataURL(file); // Lee el archivo como una cadena base64
    }
  }

  onFileSelected(event: any) {
    console.log('📂 Evento change disparado');
    const file: File = event.target.files[0];
    if (!file) {
      console.warn('⚠️ No se seleccionó archivo');
      return;
    }

    console.log('Archivo:', file.name, file.type, file.size);
    const reader = new FileReader();

    reader.onloadstart = () => console.log('⏳ Iniciando lectura...');
    reader.onloadend = () => console.log('✅ Lectura terminada');
    reader.onload = (e: any) => {
      console.log('📦 Dentro de reader.onload');
      this.signatureImg = e.target.result;
      this.signatureText = this.signatureImg.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
      console.log('✅ Imagen convertida correctamente');
    };
    reader.onerror = (e) => console.error('❌ Error al leer archivo', e);

    reader.readAsDataURL(file);
  }

}
