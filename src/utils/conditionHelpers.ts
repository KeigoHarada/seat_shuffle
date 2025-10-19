/**
 * 条件タイプに応じたアイコンIDを取得
 * @param conditionType 条件タイプ
 * @returns 対応するアイコンID
 */
export const getConditionIconId = (conditionType: string) => {
  switch (conditionType) {
    case 'student-group':
      return 'users';
    case 'role-group':
      return 'target';
    case 'student-distance':
      return 'user-check';
    default:
      return null;
  }
};

/**
 * 条件タイプに応じた名前を取得
 * @param conditionType 条件タイプ
 * @returns 条件の表示名
 */
export const getConditionName = (conditionType: string) => {
  switch (conditionType) {
    case 'student-group':
      return '生徒-グループ条件';
    case 'role-group':
      return 'ロール-グループ条件';
    case 'student-distance':
      return '生徒間距離条件';
    default:
      return '不明な条件';
  }
};
