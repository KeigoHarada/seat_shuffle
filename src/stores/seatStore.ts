import { create } from 'zustand';
import { Seat, Student, SeatLayout, AppState, Group } from '../types';

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
  
  // グループ管理
  addGroup: (group: Group) => void;
  removeGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  assignGroupToSeat: (seatId: string, groupId: string | null) => void;
  
  // 新しい機能
  selectedSeatId: string | null;
  setSelectedSeatId: (seatId: string | null) => void;
  swapSeats: (seatId1: string, seatId2: string) => void;
  assignStudentNameToSeat: (seatId: string, studentName: string) => void;
  initializeDefaultLayout: () => void;
  settingsPanelWidth: number;
  setSettingsPanelWidth: (width: number) => void;
}

export const useSeatStore = create<SeatStore>((set, get) => ({
  // 初期状態
  currentLayout: null,
  students: [],
  groups: [],
  isShuffling: false,
  showSettings: false,
  selectedSeatId: null,
  settingsPanelWidth: 600,

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

  setShuffling: (isShuffling) => set({ isShuffling }),

  // 新しい機能の実装
  setSelectedSeatId: (seatId) => set({ selectedSeatId: seatId }),

  swapSeats: (seatId1, seatId2) => set((state) => {
    if (!state.currentLayout) return state;
    
    const seat1 = state.currentLayout.seats.find(s => s.id === seatId1);
    const seat2 = state.currentLayout.seats.find(s => s.id === seatId2);
    
    if (!seat1 || !seat2) return state;
    
    return {
      currentLayout: {
        ...state.currentLayout,
        seats: state.currentLayout.seats.map(seat => {
          if (seat.id === seatId1) {
            return { ...seat, studentId: seat2.studentId };
          }
          if (seat.id === seatId2) {
            return { ...seat, studentId: seat1.studentId };
          }
          return seat;
        })
      },
      selectedSeatId: null
    };
  }),

  assignStudentNameToSeat: (seatId, studentName) => {
    const state = get();
    if (!state.currentLayout) return;
    
    // 既存の生徒を探すか、新しく作成
    let student = state.students.find(s => s.name === studentName);
    if (!student) {
      student = {
        id: `student-${Date.now()}`,
        name: studentName
      };
      set((state) => ({
        students: [...state.students, student]
      }));
    }
    
    // 席に生徒を割り当て
    set((state) => ({
      currentLayout: state.currentLayout ? {
        ...state.currentLayout,
        seats: state.currentLayout.seats.map(seat => 
          seat.id === seatId ? { ...seat, studentId: student.id, isEmpty: false } : seat
        )
      } : null
    }));
  },

  initializeDefaultLayout: () => {
    const state = get();
    if (!state.currentLayout) {
      // デフォルトの5x6レイアウトを作成
      get().createLayout(5, 6, 'デフォルト教室');
    }
  },

  setSettingsPanelWidth: (width) => set({ settingsPanelWidth: width }),

  // グループ管理の実装
  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group]
  })),

  removeGroup: (groupId) => set((state) => ({
    groups: state.groups.filter(g => g.id !== groupId),
    currentLayout: state.currentLayout ? {
      ...state.currentLayout,
      seats: state.currentLayout.seats.map(seat => 
        seat.groupId === groupId ? { ...seat, groupId: undefined } : seat
      )
    } : null
  })),

  updateGroup: (groupId, updates) => set((state) => ({
    groups: state.groups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    )
  })),

  assignGroupToSeat: (seatId, groupId) => set((state) => {
    if (!state.currentLayout) return state;
    
    return {
      currentLayout: {
        ...state.currentLayout,
        seats: state.currentLayout.seats.map(seat => 
          seat.id === seatId ? { ...seat, groupId: groupId || undefined } : seat
        )
      }
    };
  })
}));
