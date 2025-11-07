import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Aux1Service } from '../../../services/aux1.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Personal } from '../../modelos/personal';
import { DocenteCurso } from '../../modelos/docentecurso';

interface CursoAgrupado {
  nombre: string;
  codigo: string;
  semestres: string[];
}



@Component({
  selector: 'app-pdf-docente',
  standalone: true,
  imports: [CommonModule, MatButton, MatButtonModule],
  templateUrl: './pdf-docente.component.html',
  styleUrl: './pdf-docente.component.scss'
})
export class PdfDocenteComponent {
  @ViewChild('documentContent') documentContent!: ElementRef;

  // Datos del documento
  docente: any = null;
  asistente: any = null;
  categoriaActual: any = null;
  categoriaAntigua: any = null;
  dedicacion = 'Tiempo completo';
  rangoSemestre = '2020-1';
  //cursosAgrupados = ['DER101 - Introducción al Derecho', 'DER205 - Derecho Civil II'];
  cursosAgrupados: CursoAgrupado[] = [];
  personal!: Personal;
  fechaHoy = this.formatoFechaHoy();
  jefeNombre = 'Miguel David Lovatón Palacios';

  // Valores derivados (¡no usamos getters!)
  enunciacion = '';
  inicialesJefe = '';
  inicialesAsistente = '';

  isLoadingPDF = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private saux1: Aux1Service,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    console.log('Datos recibidos en diálogo:', data);
  }

  ngOnInit(): void {
    if (!this.data) {
      console.error('⚠️ No se recibieron datos en el diálogo.');
      return;
    }

    // Asignar datos del docente
    this.docente = {
      nombres: this.data.persona.nombres || '',
      apellidos: this.data.persona.apellidos || '',
      sexo: this.data.persona.sexo || 'Masculino'
    };

    this.categoriaActual = this.obtenerCampoYUltimaFecha(this.data.persona.DocenteCategoria[0]);

    this.categoriaAntigua = this.obtenerCampoYFechaMasAntigua(this.data.persona.DocenteCategoria[0]);
    // Asignar asistente: si viene en data, úsalo; si no, usa el valor por defecto (opcional)
    if (this.data.asistente) {
      this.asistente = this.data.persona.asistente;
    } else {
      // Opcional: cargar desde servicio o usar fallback
      this.asistente = { nombres: 'Carlos', apellidos: 'Ramírez Silva' };
    }

    // Calcular valores derivados una sola vez
    this.enunciacion = this.docente.sexo === 'Masculino' ? 'El señor' : 'La señora';
    this.inicialesJefe = this.obtenerIniciales(this.jefeNombre);
    this.inicialesAsistente = this.asistente
      ? this.obtenerIniciales(`${this.asistente.nombres} ${this.asistente.apellidos}`)
      : '';
  }

  obtenerCampoYUltimaFecha(docente: any): { campo: string; fecha: Date } | null {
    const mapeoCampos = [
      { campo: 'hContratado', nombre: 'Contratado' },
      { campo: 'hAuxiliar', nombre: 'Auxiliar' },
      { campo: 'hPrincipal', nombre: 'Principal' },
      { campo: 'hAsociado', nombre: 'Asociado' },
      { campo: 'hProfesorVisita', nombre: 'Profesor Visitante' },
      { campo: 'hInstructor', nombre: 'Instructor' },
      { campo: 'hJefePract', nombre: 'Jefe de Prácticas' },
      { campo: 'hAyudante', nombre: 'Ayudante' },
      { campo: 'hAsistente', nombre: 'Asistente' }
    ];

    const fechaMinima = new Date('1900-01-01T00:00:00.000Z').getTime();
    let resultado: { campo: string; fecha: Date | any } | null = null;
    let fechaMasReciente: Date | null = null;

    for (const item of mapeoCampos) {
      const valor = docente[item.campo];
      if (valor) {
        const fecha = new Date(valor);
        if (!isNaN(fecha.getTime()) && fecha.getTime() > fechaMinima) {
          // Si es la primera fecha válida o es más reciente que la actual
          if (!fechaMasReciente || fecha > fechaMasReciente) {
            fechaMasReciente = fecha;
            resultado = { campo: item.nombre, fecha: this.obtenerSemestreAcademico(fechaMasReciente) };
          }
        }
      }
    }

    return resultado;
  }

  obtenerCampoYFechaMasAntigua(docente: any): { campo: string; fecha: Date } | null {
    const mapeoCampos = [
      { campo: 'hContratado', nombre: 'Contratado' },
      { campo: 'hAuxiliar', nombre: 'Auxiliar' },
      { campo: 'hPrincipal', nombre: 'Principal' },
      { campo: 'hAsociado', nombre: 'Asociado' },
      { campo: 'hProfesorVisita', nombre: 'Profesor Visitante' },
      { campo: 'hInstructor', nombre: 'Instructor' },
      { campo: 'hJefePract', nombre: 'Jefe de Prácticas' },
      { campo: 'hAyudante', nombre: 'Ayudante' },
      { campo: 'hAsistente', nombre: 'Asistente' }
    ];

    const fechaMinima = new Date('1900-01-01T00:00:00.000Z').getTime();
    let resultado: { campo: string; fecha: Date | any } | null = null;
    let fechaMasAntigua: Date | null = null;

    for (const item of mapeoCampos) {
      const valor = docente[item.campo];
      if (valor) {
        const fecha = new Date(valor);
        const timestamp = fecha.getTime();

        // Verificar que sea una fecha válida y no sea 1970
        if (!isNaN(timestamp) && timestamp > fechaMinima) {
          // Si es la primera fecha válida o es más antigua que la actual
          if (!fechaMasAntigua || fecha < fechaMasAntigua) {
            fechaMasAntigua = fecha;
            resultado = { campo: item.nombre, fecha: this.obtenerSemestreAcademico(fechaMasAntigua) };
          }
        }
      }
    }

    return resultado;
  }

  obtenerSemestreAcademico(fechaStr: string | Date | null | undefined): string {
    if (!fechaStr) {
      return 'Sin semestre';
    }

    const date = fechaStr instanceof Date ? fechaStr : new Date(fechaStr);

    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    const anio = date.getFullYear();
    const mes = date.getMonth() + 1; // Enero = 1, ... Diciembre = 12

    return `${anio}-${mes <= 6 ? '1' : '2'}`;
  }
  getDedicacionNombre(sigla: string): string {
    const mapeo: Record<string, string> = {
      'TC': 'Tiempo Completo',
      'TPA': 'Tiempo Parcial por Asignaturas (T.P.A. por Horas)',
      'TPC': 'Tiempo Parcial Complementario (T.P.C. por Horas)',
      // Puedes agregar más si tu sistema las usa
      'TP': 'Tiempo Parcial',        // genérico (opcional)
      'HON': 'Honores',              // si aplica
      'CONS': 'Consultor',           // si aplica
    };

    return mapeo[sigla] || sigla; // Si no encuentra, devuelve la sigla original
  }
  obtenerIniciales(nombreCompleto: string): string {
    return nombreCompleto
      .trim()
      .split(/\s+/)
      .map(palabra => palabra.charAt(0).toUpperCase())
      .join('');
  }

  formatoFechaHoy(): string {
    return new Date().toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  agruparCursosPorCurso(docenteCursos: DocenteCurso[]): CursoAgrupado[] {
  const mapa = new Map<string, CursoAgrupado>();

  for (const dc of docenteCursos) {
    const curso = dc.Curso;
    if (!curso) continue;

    const key = curso.codigo; // agrupamos por código de curso

    if (!mapa.has(key)) {
      mapa.set(key, {
        nombre: curso.nombre,
        codigo: curso.codigo,
        semestres: []
      });
    }

    const item = mapa.get(key)!;
    if (!item.semestres.includes(curso.semestre)) {
      item.semestres.push(curso.semestre);
    }
  }

  // Convertir a array y ordenar semestres (opcional: descendente o ascendente)
  const resultado = Array.from(mapa.values()).map(item => ({
    ...item,
    semestres: item.semestres.sort((a, b) => {
      // Ordena como "2023-0", "2024-0", "2025-0"
      const [anioA, cicloA] = a.split('-').map(Number);
      const [anioB, cicloB] = b.split('-').map(Number);
      if (anioA !== anioB) return anioA - anioB;
      return cicloA - cicloB;
    })
  }));

  return resultado;
}



  async exportToPDF(): Promise<void> {
    this.isLoadingPDF = true;

    try {
      const element = this.documentContent.nativeElement;
      const canvas = await html2canvas(element, {
        scale: 1.5, // 👈 mejora velocidad sin sacrificar demasiada calidad
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // ancho A4 en mm
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Soporte para múltiples páginas (aunque tu doc probablemente sea 1 página)
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`certificado_${this.docente.apellidos || 'docente'}.pdf`);

    } catch (error) {
      console.error('❌ Error al generar el PDF:', error);
      // Aquí podrías usar un toast para notificar al usuario
    } finally {
      this.isLoadingPDF = false;
    }
  }
}
