import { Check, Search, X } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Outfit } from "@/constants/theme";
import type {
  AttendancePalette,
  AttendanceStatus,
  ManualStudent,
} from "./live-session-types";

const STATUS_OPTIONS: AttendanceStatus[] = [
  "Present",
  "Late",
  "Excused",
  "Absent",
];

export function MarkAttendanceSheet({
  visible,
  colors,
  students,
  search,
  selectedStudentId,
  status,
  note,
  onClose,
  onSearchChange,
  onStudentSelect,
  onStatusChange,
  onNoteChange,
  onSave,
}: {
  visible: boolean;
  colors: AttendancePalette;
  students: ManualStudent[];
  search: string;
  selectedStudentId: string | null;
  status: AttendanceStatus;
  note: string;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onStudentSelect: (id: string) => void;
  onStatusChange: (status: AttendanceStatus) => void;
  onNoteChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>
                Mark attendance
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Select a student, choose a status, and save.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.background }]}
            >
              <X size={18} color={colors.text} strokeWidth={2.2} />
            </Pressable>
          </View>

          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.background,
                borderColor: colors.backgroundSelected,
              },
            ]}
          >
            <Search size={17} color={colors.textSecondary} strokeWidth={2.2} />
            <TextInput
              value={search}
              onChangeText={onSearchChange}
              placeholder="Search student"
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          <View style={styles.studentList}>
            {students.slice(0, 4).map((student) => {
              const selected = selectedStudentId === student.id;
              return (
                <Pressable
                  key={student.id}
                  onPress={() => onStudentSelect(student.id)}
                  style={({ pressed }) => [
                    styles.studentRow,
                    {
                      backgroundColor: selected
                        ? colors.primaryMuted
                        : colors.background,
                      borderColor: selected
                        ? colors.primary
                        : colors.backgroundSelected,
                      opacity: pressed ? 0.84 : 1,
                    },
                  ]}
                >
                  <View style={styles.studentCopy}>
                    <Text
                      style={[styles.studentName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {student.name}
                    </Text>
                    {student.email ? (
                      <Text
                        style={[
                          styles.studentEmail,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {student.email}
                      </Text>
                    ) : null}
                  </View>
                  {selected ? (
                    <View
                      style={[styles.checkDot, { backgroundColor: colors.primary }]}
                    >
                      <Check
                        size={13}
                        color={colors.primaryForeground}
                        strokeWidth={2.8}
                      />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map((option) => {
              const selected = status === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => onStatusChange(option)}
                  style={({ pressed }) => [
                    styles.statusChip,
                    {
                      backgroundColor: selected
                        ? `${colors.secondary}18`
                        : colors.background,
                      borderColor: selected
                        ? colors.secondary
                        : colors.backgroundSelected,
                      opacity: pressed ? 0.82 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: selected ? colors.secondary : colors.textSecondary },
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            style={[
              styles.noteBox,
              {
                backgroundColor: colors.background,
                borderColor: colors.backgroundSelected,
              },
            ]}
          >
            <TextInput
              value={note}
              onChangeText={onNoteChange}
              placeholder="Optional note"
              placeholderTextColor={colors.textSecondary}
              multiline
              style={[styles.noteInput, { color: colors.text }]}
            />
          </View>

          <Pressable
            onPress={onSave}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.84 : 1,
              },
            ]}
          >
            <Text
              style={[styles.saveText, { color: colors.primaryForeground }]}
            >
              Save attendance
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.36)",
  },
  sheet: {
    maxHeight: "88%",
    borderTopWidth: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 30,
    gap: 14,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(120,120,120,0.35)",
    marginBottom: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Outfit.bold,
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: -0.35,
  },
  subtitle: {
    fontFamily: Outfit.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: "continuous",
    paddingHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    fontFamily: Outfit.medium,
    fontSize: 14,
    lineHeight: 19,
    paddingVertical: 0,
  },
  studentList: {
    gap: 8,
  },
  studentRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: "continuous",
    paddingHorizontal: 13,
    gap: 10,
  },
  studentCopy: {
    flex: 1,
    gap: 1,
  },
  studentName: {
    fontFamily: Outfit.semiBold,
    fontSize: 14,
    lineHeight: 19,
  },
  studentEmail: {
    fontFamily: Outfit.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  checkDot: {
    width: 23,
    height: 23,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChip: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 13,
  },
  statusText: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  noteBox: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: "continuous",
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  noteInput: {
    minHeight: 54,
    textAlignVertical: "top",
    fontFamily: Outfit.regular,
    fontSize: 14,
    lineHeight: 20,
    padding: 0,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 17,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontFamily: Outfit.bold,
    fontSize: 14,
    lineHeight: 19,
  },
});
