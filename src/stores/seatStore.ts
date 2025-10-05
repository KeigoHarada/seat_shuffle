import { create } from 'zustand';
import { Seat, Student, SeatLayout, AppState } from '../types';

interface SeatStore extends AppState {
  // アクション
  setCurrentLayout: (layout: SeatLayout) => void;
  addStudent: (student: Student) => void;
  removeStudent: (studentId: string) => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  assignStudentToSeat: (studentId: string, seatId: string) => void;
  removeStudentFromSeat: (seatId: string) => void;
  createLayout: (rows: number, cols: number, name: string) => void;
  toggleSeatEmpty: (seatId: string) => void;
  shuffleSeats: () => void;
  toggleSettings: () => void;
  setShuffling: (isShuffling: boolean) => void;
}

export const useSeatStore = create<SeatStore>((set, get) => ({
  // 初期状態
  currentLayout: null,
  students: [],
  isShuffling: false,
  showSettings: false,

  // アクション
  setCurrentLayout: (layout) => set({ currentLayout: layout }),

  addStudent: (student) => set((state) => ({
    students: [...state.students, student]
  })),

  removeStudent: (studentId) => set((state) => ({
    students: state.students.filter(s => s.id !== studentId),
    currentLayout: state.currentLayout ? {
      ...state.currentLayout,
      seats: state.currentLayout.seats.map(seat => 
        seat.studentId === studentId ? { ...seat, studentId: undefined } : seat
      )
    } : null
  })),

  updateStudent: (studentId, updates) => set((state) => ({
    students: state.students.map(s => 
      s.id === studentId ? { ...s, ...updates } : s
    )
  })),

  assignStudentToSeat: (studentId, seatId) => set((state) => {
    if (!state.currentLayout) return state;
    
    return {
      currentLayout: {
        ...state.currentLayout,
        seats: state.currentLayout.seats.map(seat => 
          seat.id === seatId ? { ...seat, studentId } : seat
        )
      }
    };
  }),

  removeStudentFromSeat: (seatId) => set((state) => {
    if (!state.currentLayout) return state;
    
    return {
      currentLayout: {
        ...state.currentLayout,
        seats: state.currentLayout.seats.map(seat => 
          seat.id === seatId ? { ...seat, studentId: undefined } : seat
        )
      }
    };
  }),

  createLayout: (rows, cols, name) => {
    const seats: Seat[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        seats.push({
          id: `seat-${row}-${col}`,
          row,
          col,
          isEmpty: false
        });
      }
    }

    const layout: SeatLayout = {
      id: `layout-${Date.now()}`,
      name,
      rows,
      cols,
      seats
    };

    set({ currentLayout: layout });
  },

  toggleSeatEmpty: (seatId) => set((state) => {
    if (!state.currentLayout) return state;
    
    return {
      currentLayout: {
        ...state.currentLayout,
        seats: state.currentLayout.seats.map(seat => 
          seat.id === seatId ? { ...seat, isEmpty: !seat.isEmpty, studentId: undefined } : seat
        )
      }
    };
  }),

  shuffleSeats: () => {
    const state = get();
    if (!state.currentLayout) return;

    set({ isShuffling: true });

    // シャッフルエフェクトのための遅延
    setTimeout(() => {
      const { currentLayout, students } = get();
      if (!currentLayout) return;

      // 空席でない席のみを取得
      const availableSeats = currentLayout.seats.filter(seat => !seat.isEmpty);
      
      // 生徒をランダムにシャッフル
      const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
      
      // 席に生徒を割り当て
      const newSeats = currentLayout.seats.map(seat => {
        if (seat.isEmpty) return seat;
        
        const studentIndex = availableSeats.indexOf(seat);
        const student = shuffledStudents[studentIndex];
        
        return {
          ...seat,
          studentId: student?.id
        };
      });

      set({
        currentLayout: {
          ...currentLayout,
          seats: newSeats
        },
        isShuffling: false
      });
    }, 2000); // 2秒間のシャッフルエフェクト
  },

  toggleSettings: () => set((state) => ({
    showSettings: !state.showSettings
  })),

  setShuffling: (isShuffling) => set({ isShuffling })
}));
