---
name: liquid-glass-design
description: Sistema de diseño Liquid Glass del Gestor de Gastos. Usar al crear o modificar pantallas, modales, tarjetas, botones, inputs o cualquier estilo en src/app o src/components, y al revisar si un componente respeta el diseño (colores, espaciado, efecto glass, teclado, formularios).
---

# Liquid Glass — Gestor de Gastos

La referencia completa está en `DESIGN_SYSTEM.md` (raíz del proyecto). Los valores salen de `src/constants/theme.ts`. Antes de escribir estilos, lee ambos.

## Reglas obligatorias

1. **Nada de valores sueltos.** Colores desde `LiquidGlassColors`, gradientes desde `LiquidGlassGradients`, espaciado desde `Spacing`. Si hace falta un color nuevo, agrégalo como token en `theme.ts` con un comentario de uso; no escribas `rgba(...)` ni `#hex` en un componente.
   - Excepciones permitidas: tamaños de fuente, `borderRadius` de formas (círculos `999`, FAB `32`, handle `2`) y `paddingBottom: 100` de listas (espacio para el FAB).
2. **Efecto glass:** tarjetas con `GlassCard`; círculos de color (`orbPink`, `orbOrange`, `orbPurple`, con `pointerEvents="none"`) entre el fondo y el contenido; gradientes encima de una card con `LiquidGlassGradients.card` (translúcido); paneles y modales con `panelBackground` (0.45).
3. **Pantalla nueva:** `LinearGradient colors={LiquidGlassGradients.screen}` + círculos + `SafeAreaView` (de `react-native-safe-area-context`) + contenido con `paddingHorizontal: Spacing.four`. Copiar de `src/app/index.tsx`.
4. **Modal:** copiar la estructura de `src/components/AddExpenseModal.tsx` (backdrop con `BlurView`, `SlideInDown`, handle, `ScrollView`).
5. **Teclado:** todo lo que tenga inputs usa `KeyboardAvoidingView` (`'padding'` iOS, `'height'` Android) y `ScrollView` con `keyboardShouldPersistTaps="handled"`.
6. **Animación de listas:** cada item en `Animated.View` con `entering={FadeInDown.delay(index * 100).springify()}`.

## Componentes de referencia

| Necesitas | Token / patrón | Ejemplo |
|-----------|----------------|---------|
| Botón principal / elemento seleccionado | `LinearGradient colors={LiquidGlassGradients.primary}` `start={{x:0,y:0}} end={{x:1,y:1}}` | FAB y chips de orden en `index.tsx` |
| Input, chip o botón secundario | fondo `inputBackground`, `borderWidth: 1`, `glassBorder`, `borderRadius: Spacing.two` | `inputContainer`, `cancelButton` |
| Selector tipo chip (uno activo) | activo con gradiente `primary` + `glassTextLight`; inactivo con `inputBackground` + `glassText` | categorías del modal, `sortRow` |
| Acción destructiva | borde y texto `secondary`, fondo `dangerBackground`, siempre con `Alert` de confirmación | `deleteButton` del modal |
| Error de campo | borde `inputError` (secondary, 1.5) + texto `errorText` (12, 600, secondary) debajo | monto, categoría y descripción |
| Texto de ayuda / contador | 12, `glassTextSecondary` | `hint`, `counterText` |

## Tipografía

- Título de pantalla: 28, bold, `glassText`. Título de modal: 24, bold.
- Números grandes: 42, bold, `letterSpacing: -1`, `glassTextLight`.
- Etiquetas: 14, 600, `glassText`; los campos obligatorios llevan ` *`.

## Formularios

- Las reglas de validación van en `src/utils/validation.ts`, no dentro del componente.
- El botón de guardar no se desactiva por campos inválidos: al pulsarlo se validan todos los campos, se marca cada error en su campo y se muestra un `Alert` con el resumen.

## Al terminar, verifica

- [ ] `grep -rnE "rgba\(|'#[0-9A-Fa-f]{3,6}'" src/app src/components` no devuelve nada
- [ ] Fondo con gradiente `screen` y círculos de color
- [ ] Cards con `GlassCard`, gradientes translúcidos sobre cards, paneles con `panelBackground`
- [ ] Inputs dentro de `ScrollView` + `KeyboardAvoidingView`
- [ ] `npx tsc --noEmit` sin errores
