import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';

class Note {
  title: string;
  content: string;
  lastEdit: number;
  filter: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  notes: Note[] = [];

  selectedNote: Note;
  selectedNoteContent: string;

  DEFAULT_NOTE_TITLE = 'New Note';
  DEFAULT_NOTE_CONTENT = 'No additional content';
  private LOCAL_STORAGE_NOTES_KEY = 'notes';

  isMobile = false;

  @ViewChild('textEditor', { read: ElementRef }) textEditor: ElementRef;
  @ViewChild('sidebar', { read: ElementRef }) sidebarElement: ElementRef;

  constructor() { }

  ngOnInit() {
    this.notes = this.getNotesFromLocalStorage();
    this.filterNotes();
    this.selectNote(this.notes[0]);
  }

  ngAfterViewInit() {
    this.detectInitialLayout();
  }

  createNote() {
    const timestamp = this.getTimestamp();
    const note: Note = {
      title: '',
      content: '',
      lastEdit: timestamp,
      filter: true,
    };
    return note;
  }

  addNote() {
    const note = this.createNote();
    this.notes.unshift(note);
    this.selectNote(this.notes[0]);
    this.writeNotesToLocalStorage(this.notes);
  }

  updateNote() {
    const selectedNoteContent = this.selectedNoteContent.trim();
    const paragraphs = selectedNoteContent.split('\n');
    const title = paragraphs.shift();
    const content = paragraphs.join('\n');
    this.selectedNote.title = title;
    this.selectedNote.content = content;
    const timestamp = this.getTimestamp();
    this.selectedNote.lastEdit = timestamp;
    this.writeNotesToLocalStorage(this.notes);
  }

  deleteSelectedNote() {
    let index = this.notes.indexOf(this.selectedNote);
    if (index >= 0) {
      this.notes.splice(index, 1);
      if (this.notes.length === 0) {
        const note = this.createNote();
        this.notes.unshift(note);
      }
      if (!this.notes[index]) {
        index = this.notes.length - 1;
      }
      this.selectNote(this.notes[index]);
      this.writeNotesToLocalStorage(this.notes);
    }
  }

  selectNote(note: Note) {
    this.selectedNote = note;
    let selectedNoteContent = note.title;
    if (note.content.length) {
      selectedNoteContent += '\n' + note.content;
    }
    this.selectedNoteContent = selectedNoteContent;
    setTimeout(() => {
      if (this.isMobile) { this.hideSidebar(); }
    }, 250);
  }

  hideSidebar() {
    if (!this.sidebarElement) {
      return;
    }
    if (!this.sidebarElement.nativeElement) {
      return;
    }
    const sidebarElement = this.sidebarElement.nativeElement;
    sidebarElement.classList.remove('collapsed');
    sidebarElement.classList.add('collapsed');
  }

  showSidebar() {
    if (!this.sidebarElement) {
      return;
    }
    if (!this.sidebarElement.nativeElement) {
      return;
    }
    const sidebarElement = this.sidebarElement.nativeElement;
    sidebarElement.classList.remove('collapsed');
  }

  toggleSidebar() {
    if (!this.sidebarElement) {
      return;
    }
    if (!this.sidebarElement.nativeElement) {
      return;
    }
    const sidebarElement = this.sidebarElement.nativeElement;
    sidebarElement.classList.toggle('collapsed');
  }

  @HostListener('window:resize', ['$event'])
  detectInitialLayout() {
    const _window: Window = window;
    if (_window.innerWidth > 992) {
      this.isMobile = false;
      this.showSidebar();
    } else {
      this.isMobile = true;
      this.hideSidebar();
    }
  }

  getTimestamp() {
    const timestamp = Date.now();
    return timestamp;
  }

  filterNotes(value = '') {
    this.notes.forEach((note: Note) => {
      if (value === '') {
        note.filter = true;
      } else {
        let filter = false;
        const inTitle = (note.title) ? note.title.includes(value) : false;
        const inContent = (note.content) ? note.content.includes(value) : false;
        if (inTitle || inContent) {
          filter = true;
        }
        note.filter = filter;
      }
    });
  }

  getNotesFromLocalStorage() {
    let notes: Note[];
    const _notes = window.localStorage.getItem(this.LOCAL_STORAGE_NOTES_KEY);
    if (_notes) {
      notes = JSON.parse(_notes);
    } else {
      const note = this.createNote();
      notes = [note];
      this.writeNotesToLocalStorage(notes);
    }
    return notes;
  }

  writeNotesToLocalStorage(notes: Note[]) {
    const _notes = JSON.stringify(notes);
    window.localStorage.setItem(this.LOCAL_STORAGE_NOTES_KEY, _notes);
    return true;
  }

  ngOnDestroy() {
  }

}
