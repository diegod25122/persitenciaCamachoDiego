import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MonthlyHeader } from '@/components/MonthlyHeader';
import { ExpenseItem } from '@/components/ExpenseItem';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { useExpenses } from '@/context/ExpenseContext';
import { LiquidGlassColors, LiquidGlassGradients, Spacing } from '@/constants/theme';
import { Expense, SortOption } from '@/types/expense';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recientes', label: '🕒 Recientes' },
  { value: 'mayorMonto', label: '💰 Mayor monto' },
];

// Pantalla principal: total del mes, lista de gastos y el boton + para agregar
export default function HomeScreen() {
  const { getCurrentMonthExpenses, isLoading } = useExpenses();
  const [modalVisible, setModalVisible] = useState(false);
  // null = agregar un gasto nuevo; con un gasto = editarlo
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recientes');
  const expenses = getCurrentMonthExpenses(sortBy);

  const openModal = (expense: Expense | null) => {
    setSelectedExpense(expense);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={LiquidGlassGradients.screen}
        style={styles.gradient}
      >
        {/* Circulos de color detras: dan algo que desenfocar a las tarjetas */}
        <View pointerEvents="none" style={[styles.orb, styles.orbPink]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbOrange]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbPurple]} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.appTitle}>Gastos Poliestudiante</Text>

            <MonthlyHeader />
            {/* Mientras se leen los datos guardados se muestra un indicador;
                sin esto se veria un instante el mensaje de "no hay gastos" */}
            {isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={LiquidGlassColors.primary} />
              </View>

              /* Si no hay gastos este mes mostramos un mensaje en vez de la lista */
            ) : expenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💸</Text>
                <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
                <Text style={styles.emptyText}>
                  Presiona el botón + para agregar tu primer gasto
                </Text>
              </View>
            ) : (
              <>
                {/* Filtro de ordenamiento: el elegido se pinta con el gradiente */}
                <View style={styles.sortRow}>
                  {SORT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.sortButton}
                      onPress={() => setSortBy(option.value)}
                      activeOpacity={0.8}
                    >
                      {sortBy === option.value ? (
                        <LinearGradient
                          colors={LiquidGlassGradients.primary}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.sortInner}
                        >
                          <Text style={styles.sortTextActive}>{option.label}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.sortInner}>
                          <Text style={styles.sortText}>{option.label}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <FlatList
                  data={expenses}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item, index }) => (
                    <ExpenseItem
                      expense={item}
                      index={index}
                      onPress={() => openModal(item)}
                    />
                  )}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </View>

          {/* Boton + de la esquina */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => openModal(null)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={LiquidGlassGradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Text style={styles.fabIcon}>+</Text>
            </LinearGradient>
          </TouchableOpacity>

          <AddExpenseModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            expense={selectedExpense}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPink: {
    width: 220,
    height: 220,
    top: 60,
    left: -60,
    backgroundColor: LiquidGlassColors.orbPink,
  },
  orbOrange: {
    width: 180,
    height: 180,
    top: 260,
    right: -50,
    backgroundColor: LiquidGlassColors.orbOrange,
  },
  orbPurple: {
    width: 200,
    height: 200,
    bottom: 120,
    left: 20,
    backgroundColor: LiquidGlassColors.orbPurple,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  sortRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  sortButton: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    backgroundColor: LiquidGlassColors.inputBackground,
  },
  sortInner: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  sortTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassTextLight,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.four,
    right: Spacing.four,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: LiquidGlassColors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '300',
  },
});
