import { create } from 'zustand';
import { Seat, Student, SeatLayout, AppState, Group, Role } from '../types';

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
  
  // ロール管理
  addRole: (role: Role) => void;
  removeRole: (roleId: string) => void;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  assignRoleToStudent: (studentId: string, roleId: string) => void;
  removeRoleFromStudent: (studentId: string, roleId: string) => void;
  
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
  roles: [],
  isShuffling: false,
  showSettings: false,
  selectedSeatId: null,
  settingsPanelWidth: 600,

  // アクション
  setCurrentLayout: (layout) => set({ currentLayout: layout }),

  addStudent: (student) => set((state) => {
    // 生徒番号を自動で割り当て（連番で詰める）
    const studentWithNumber = {
      ...student,
      studentNumber: state.students.length + 1,
      roleIds: student.roleIds || []
    };
    
    return {
      students: [...state.students, studentWithNumber]
    };
  }),

  removeStudent: (studentId) => set((state) => {
    // 生徒を削除
    const updatedStudents = state.students.filter(s => s.id !== studentId);
    
    // 生徒番号を詰める（1から連番に再割り当て）
    const renumberedStudents = updatedStudents.map((student, index) => ({
      ...student,
      studentNumber: index + 1
    }));
    
    return {
      students: renumberedStudents,
      currentLayout: state.currentLayout ? {
        ...state.currentLayout,
        seats: state.currentLayout.seats.map(seat => 
          seat.studentId === studentId ? { ...seat, studentId: undefined } : seat
        )
      } : null
    };
  }),

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
    
    // 削除される生徒のIDを取得
    const seatToRemove = state.currentLayout.seats.find(seat => seat.id === seatId);
    const studentIdToRemove = seatToRemove?.studentId;
    
    // 席から生徒を削除
    const updatedLayout = {
      ...state.currentLayout,
      seats: state.currentLayout.seats.map(seat => 
        seat.id === seatId ? { ...seat, studentId: undefined } : seat
      )
    };
    
    // 生徒管理からも削除（生徒番号を詰める）
    if (studentIdToRemove) {
      const updatedStudents = state.students.filter(s => s.id !== studentIdToRemove);
      const renumberedStudents = updatedStudents.map((student, index) => ({
        ...student,
        studentNumber: index + 1
      }));
      
      return {
        currentLayout: updatedLayout,
        students: renumberedStudents
      };
    }
    
    return {
      currentLayout: updatedLayout
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
    
    // 空席に変更される席の生徒IDを取得
    const seatToToggle = state.currentLayout.seats.find(seat => seat.id === seatId);
    const studentIdToRemove = seatToToggle?.studentId;
    
    // 席を空席に変更
    const updatedLayout = {
      ...state.currentLayout,
      seats: state.currentLayout.seats.map(seat => 
        seat.id === seatId ? { ...seat, isEmpty: !seat.isEmpty, studentId: undefined } : seat
      )
    };
    
    // 空席に変更する場合、生徒管理からも削除（生徒番号を詰める）
    if (studentIdToRemove && !seatToToggle.isEmpty) {
      const updatedStudents = state.students.filter(s => s.id !== studentIdToRemove);
      const renumberedStudents = updatedStudents.map((student, index) => ({
        ...student,
        studentNumber: index + 1
      }));
      
      return {
        currentLayout: updatedLayout,
        students: renumberedStudents
      };
    }
    
    return {
      currentLayout: updatedLayout
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
        name: studentName,
        studentNumber: state.students.length + 1,
        roleIds: []
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
      
      // デバッグ用の生徒データを作成
      const debugStudents = [
        { id: 'student-1', name: '田中太郎', studentNumber: 1, roleIds: [] },
        { id: 'student-2', name: '佐藤花子', studentNumber: 2, roleIds: [] },
        { id: 'student-3', name: '鈴木次郎', studentNumber: 3, roleIds: [] },
        { id: 'student-4', name: '高橋美咲', studentNumber: 4, roleIds: [] },
        { id: 'student-5', name: '伊藤健太', studentNumber: 5, roleIds: [] },
        { id: 'student-6', name: '渡辺さくら', studentNumber: 6, roleIds: [] },
        { id: 'student-7', name: '山本大輔', studentNumber: 7, roleIds: [] },
        { id: 'student-8', name: '中村優子', studentNumber: 8, roleIds: [] },
        { id: 'student-9', name: '小林翔太', studentNumber: 9, roleIds: [] },
        { id: 'student-10', name: '加藤愛美', studentNumber: 10, roleIds: [] },
        { id: 'student-11', name: '吉田直樹', studentNumber: 11, roleIds: [] },
        { id: 'student-12', name: '松本麻衣', studentNumber: 12, roleIds: [] },
        { id: 'student-13', name: '井上雄介', studentNumber: 13, roleIds: [] },
        { id: 'student-14', name: '木村由美', studentNumber: 14, roleIds: [] },
        { id: 'student-15', name: '林健一', studentNumber: 15, roleIds: [] },
        { id: 'student-16', name: '清水美穂', studentNumber: 16, roleIds: [] },
        { id: 'student-17', name: '山口拓也', studentNumber: 17, roleIds: [] },
        { id: 'student-18', name: '池田理恵', studentNumber: 18, roleIds: [] },
        { id: 'student-19', name: '前田和也', studentNumber: 19, roleIds: [] },
        { id: 'student-20', name: '藤原香織', studentNumber: 20, roleIds: [] }
      ];
      
      // 生徒を追加
      debugStudents.forEach(student => {
        get().addStudent(student);
      });
      
      // 席に生徒をランダムに割り当て（一部空席も作成）
      const currentLayout = get().currentLayout;
      if (currentLayout) {
        const availableSeats = currentLayout.seats.filter(seat => !seat.isEmpty);
        const shuffledStudents = [...debugStudents].sort(() => Math.random() - 0.5);
        
        // 一部の席を空席にする（約20%）
        const emptySeatCount = Math.floor(availableSeats.length * 0.2);
        const seatsToEmpty = availableSeats
          .sort(() => Math.random() - 0.5)
          .slice(0, emptySeatCount);
        
        seatsToEmpty.forEach(seat => {
          get().toggleSeatEmpty(seat.id);
        });
        
        // 残りの席に生徒を割り当て（全ての席に名前を登録）
        const remainingSeats = availableSeats.filter(seat => 
          !seatsToEmpty.some(emptySeat => emptySeat.id === seat.id)
        );
        
        // 全ての席に生徒を割り当て（生徒数が足りない場合は追加の生徒を作成）
        remainingSeats.forEach((seat, index) => {
          if (index < shuffledStudents.length) {
            get().assignStudentToSeat(shuffledStudents[index].id, seat.id);
          } else {
            // 追加の生徒を作成
            const additionalStudent = {
              id: `student-${Date.now()}-${index}`,
              name: `生徒${index + 1}`,
              studentNumber: shuffledStudents.length + index + 1,
              roleIds: []
            };
            get().addStudent(additionalStudent);
            get().assignStudentToSeat(additionalStudent.id, seat.id);
          }
        });
      }
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
  }),

  // ロール管理の実装
  addRole: (role) => set((state) => ({
    roles: [...state.roles, role]
  })),

  removeRole: (roleId) => set((state) => ({
    roles: state.roles.filter(r => r.id !== roleId),
    students: state.students.map(student => ({
      ...student,
      roleIds: student.roleIds.filter(id => id !== roleId)
    }))
  })),

  updateRole: (roleId, updates) => set((state) => ({
    roles: state.roles.map(r => 
      r.id === roleId ? { ...r, ...updates } : r
    )
  })),

  assignRoleToStudent: (studentId, roleId) => set((state) => ({
    students: state.students.map(student => 
      student.id === studentId 
        ? { ...student, roleIds: [...student.roleIds.filter(id => id !== roleId), roleId] }
        : student
    )
  })),

  removeRoleFromStudent: (studentId, roleId) => set((state) => ({
    students: state.students.map(student => 
      student.id === studentId 
        ? { ...student, roleIds: student.roleIds.filter(id => id !== roleId) }
        : student
    )
  }))
}));
