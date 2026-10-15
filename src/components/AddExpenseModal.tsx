import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Category, CATEGORIES, CATEGORY_ICONS, Expense } from '@/types/expense';
import { LiquidGlassColors, LiquidGlassGradients, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';
import {
  DESCRIPTION_MAX_LENGTH,
  sanitizeAmountInput,
  sanitizeDescription,
  validateAmount,
  validateDescription,
} from '@/utils/validation';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  // Si llega un gasto, el modal se abre en modo edicion con sus datos cargados
  expense?: Expense | null;
}

// Modal que sube desde abajo para registrar o editar un gasto.
// Obligatorios: monto, categoria y fecha. Opcionales: descripcion y foto de la factura.
export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  expense,
}) => {
  const { addExpense, updateExpense, deleteExpense } = useExpenses();
  const isEditing = !!expense;

  // El monto es string porque asi trabaja el TextInput; se pasa a numero al guardar
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [facturaAdjunta, setFacturaAdjunta] = useState<string | undefined>();
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Mensajes de error de cada campo (null = sin error)
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // Cada vez que se abre el modal se cargan los datos del gasto a editar,
  // o se deja el formulario vacio con la fecha de hoy si es uno nuevo
  useEffect(() => {
    if (!visible) return;
    // Redondeado a 2 decimales por si hay gastos viejos guardados con mas
    setAmount(expense ? String(Math.round(expense.amount * 100) / 100) : '');
    setCategory(expense?.category ?? null);
    setDescription(expense?.description ?? '');
    setDate(expense ? new Date(expense.date) : new Date());
    setFacturaAdjunta(expense?.facturaAdjunta);
    setShowIosPicker(false);
    setAmountError(null);
    setCategoryError(null);
    setDescriptionError(null);
  }, [visible, expense]);

  // Solo se acepta la tecla si el texto sigue siendo un numero con max. 2 decimales
  const handleAmountChange = (text: string) => {
    const sanitized = sanitizeAmountInput(text);
    if (sanitized === null) return;
    setAmount(sanitized);
    if (amountError) setAmountError(null);
  };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setCategoryError(null);
  };

  // Se borran los caracteres especiales al escribir o pegar y se avisa al usuario
  const handleDescriptionChange = (text: string) => {
    const { value, hadInvalidChars } = sanitizeDescription(text);
    setDescription(value);
    setDescriptionError(
      hadInvalidChars ? 'Solo se permiten letras, números y espacios.' : null
    );
  };

  // async porque ahora hay que esperar a que el gasto se guarde en el telefono
  const handleSubmit = async () => {
    if (isSaving) return;

    // Se validan todos los campos y se muestran todos los errores a la vez
    const newAmountError = validateAmount(amount);
    const newCategoryError = category ? null : 'Selecciona una categoría para el gasto.';
    const newDescriptionError = validateDescription(description);
    setAmountError(newAmountError);
    setCategoryError(newCategoryError);
    setDescriptionError(newDescriptionError);

    if (newAmountError || newCategoryError || newDescriptionError || !category) {
      Alert.alert(
        'Revisa el formulario',
        [newAmountError, newCategoryError, newDescriptionError]
          .filter(Boolean)
          .join('\n')
      );
      return;
    }

    const data = {
      amount: parseFloat(amount),
      category,
      date,
      description: description.trim() || undefined,
      facturaAdjunta,
    };

    setIsSaving(true);
    try {
      if (expense) {
        await updateExpense({ ...data, id: expense.id });
      } else {
        await addExpense(data);
      }
    } catch (error) {
      // Si no se pudo guardar, se avisa y el modal queda abierto con los datos
      console.error('Error al guardar el gasto', error);
      Alert.alert('Error', 'No se pudo guardar el gasto. Intenta de nuevo.');
      return;
    } finally {
      setIsSaving(false);
    }

    onClose();
  };

  // El formulario se reinicia solo al volver a abrir (ver el useEffect)
  const handleClose = () => {
    onClose();
  };

  const handleDelete = () => {
    if (!expense) return;
    Alert.alert('Eliminar gasto', '¿Seguro que quieres eliminar este gasto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(expense.id);
            onClose();
          } catch (error) {
            console.error('Error al eliminar el gasto', error);
            Alert.alert('Error', 'No se pudo eliminar el gasto. Intenta de nuevo.');
          }
        },
      },
    ]);
  };

  // ---- Fecha ----
  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'ios') setShowIosPicker(false);
    if (event.type === 'set' && selected) setDate(selected);
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      // En Android el selector es un dialogo nativo que se abre con esta funcion
      DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        maximumDate: new Date(), // no se pueden registrar gastos en el futuro
        onChange: onDateChange,
      });
    } else {
      setShowIosPicker((prev) => !prev);
    }
  };

  const formattedDate = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const now = new Date();
  const isOtherMonth =
    date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear();

  // ---- Factura ----
  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso denegado', 'Activa el permiso de cámara para tomar la foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) setFacturaAdjunta(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) setFacturaAdjunta(result.assets[0].uri);
  };

  const handleAttach = () => {
    Alert.alert('Adjuntar factura', '¿De dónde quieres tomar la imagen?', [
      { text: 'Cámara', onPress: pickFromCamera },
      { text: 'Galería', onPress: pickFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
        keyboardVerticalOffset={0}
      >
        {/* Tocar el fondo tambien cierra el modal */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          entering={SlideInDown.springify()}
          style={styles.modalContent}
        >
          <View style={styles.modalBackground}>
            <BlurView intensity={100} tint="light" style={styles.modalBlur}>
              <View style={styles.handleBar} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.title}>
                  {isEditing ? 'Editar Gasto' : 'Agregar Gasto'}
                </Text>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Monto (USD) *</Text>
                  <View style={[styles.inputContainer, amountError && styles.inputError]}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={handleAmountChange}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    />
                  </View>
                  {amountError && <Text style={styles.errorText}>{amountError}</Text>}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Fecha</Text>
                  <TouchableOpacity style={styles.fieldButton} onPress={openDatePicker}>
                    <Text style={styles.fieldIcon}>📅</Text>
                    <Text style={styles.fieldText}>{formattedDate}</Text>
                  </TouchableOpacity>
                  {Platform.OS === 'ios' && showIosPicker && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="inline"
                      maximumDate={new Date()}
                      locale="es-ES"
                      accentColor={LiquidGlassColors.primary}
                      onChange={onDateChange}
                    />
                  )}
                  {isOtherMonth && (
                    <Text style={styles.hint}>
                      Este gasto no es del mes actual, por eso no aparecerá en la lista ni en el total.
                    </Text>
                  )}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Categoría *</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={styles.categoriesContent}
                  >
                    {/* La elegida se pinta con el gradiente */}
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => handleCategorySelect(cat)}
                        style={[
                          styles.categoryButton,
                          category === cat && styles.categoryButtonActive,
                        ]}
                      >
                        {category === cat ? (
                          <LinearGradient
                            colors={LiquidGlassGradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.categoryGradient}
                          >
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryTextActive}>{cat}</Text>
                          </LinearGradient>
                        ) : (
                          <>
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryText}>{cat}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {categoryError && <Text style={styles.errorText}>{categoryError}</Text>}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Descripción (opcional)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.descriptionInput,
                      descriptionError && styles.inputError,
                    ]}
                    value={description}
                    onChangeText={handleDescriptionChange}
                    placeholder="Ej: Almuerzo en la universidad"
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    multiline
                  />
                  <View style={styles.helperRow}>
                    <Text style={styles.errorText}>{descriptionError ?? ''}</Text>
                    <Text style={styles.counterText}>
                      {description.length}/{DESCRIPTION_MAX_LENGTH}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Factura / comprobante (opcional)</Text>
                  {facturaAdjunta ? (
                    <View>
                      <Image
                        source={{ uri: facturaAdjunta }}
                        style={styles.receiptPreview}
                        contentFit="cover"
                      />
                      <View style={styles.receiptActions}>
                        <TouchableOpacity style={styles.smallButton} onPress={handleAttach}>
                          <Text style={styles.smallButtonText}>Cambiar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.smallButton}
                          onPress={() => setFacturaAdjunta(undefined)}
                        >
                          <Text style={[styles.smallButtonText, styles.dangerText]}>Quitar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.fieldButton} onPress={handleAttach}>
                      <Text style={styles.fieldIcon}>📎</Text>
                      <Text style={styles.fieldText}>Adjuntar foto (cámara o galería)</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      isSaving && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isSaving}
                  >
                    <LinearGradient
                      colors={LiquidGlassGradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitButtonText}>
                        {isEditing ? 'Guardar' : 'Agregar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {isEditing && (
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>🗑️  Eliminar gasto</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </BlurView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropBlur: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  modalBackground: {
    // Bajito a proposito: si es casi opaco no se ve el blur del fondo
    backgroundColor: LiquidGlassColors.panelBackground,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  modalBlur: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: LiquidGlassColors.glassTextSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    opacity: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.four,
  },
  inputSection: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LiquidGlassColors.inputBackground,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginRight: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: LiquidGlassColors.glassText,
    paddingVertical: Spacing.three,
  },
  descriptionInput: {
    backgroundColor: LiquidGlassColors.inputBackground,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LiquidGlassColors.inputBackground,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  fieldIcon: {
    fontSize: 20,
    marginRight: Spacing.two,
  },
  fieldText: {
    flex: 1,
    fontSize: 16,
    color: LiquidGlassColors.glassText,
    textTransform: 'capitalize',
  },
  inputError: {
    borderColor: LiquidGlassColors.secondary,
    borderWidth: 1.5,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: LiquidGlassColors.secondary,
    marginTop: Spacing.one,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  counterText: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
    marginTop: Spacing.one,
    marginLeft: Spacing.two,
  },
  hint: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
    marginTop: Spacing.one,
  },
  receiptPreview: {
    width: '100%',
    height: 180,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  smallButton: {
    flex: 1,
    backgroundColor: LiquidGlassColors.inputBackground,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  dangerText: {
    color: LiquidGlassColors.secondary,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.two,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  categoryButton: {
    backgroundColor: LiquidGlassColors.inputBackground,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    padding: Spacing.two,
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: 'transparent',
  },
  categoryGradient: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    width: '100%',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  categoryText: {
    fontSize: 12,
    color: LiquidGlassColors.glassText,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: LiquidGlassColors.inputBackground,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  submitButton: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
  },
  deleteButton: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.secondary,
    backgroundColor: LiquidGlassColors.dangerBackground,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.secondary,
  },
});
