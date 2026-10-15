# Sistema de Diseño - Liquid Glass

Base visual para crear pantallas y modales nuevos con el mismo estilo. Los valores salen de `src/constants/theme.ts`; los ejemplos reales están en `src/components/` y `src/app/index.tsx`.

## Colores y espaciado

```typescript
import { LiquidGlassColors, LiquidGlassGradients, Spacing } from '@/constants/theme';
```

| Uso | Token |
|-----|-------|
| Gradiente destacado (botones, seleccionado) | `LiquidGlassGradients.primary` (`#FF6B9D` → `#C44569`) |
| Gradiente sobre una `GlassCard` | `LiquidGlassGradients.card` (mismo, al 0.7) |
| Fondo de pantalla | `LiquidGlassGradients.screen` |
| Texto principal | `glassText #2C1B47` |
| Texto secundario | `glassTextSecondary #8B6B8F` |
| Texto sobre gradiente | `glassTextLight #FFFBF5` |
| Borde glass | `glassBorder` |
| Fondo de inputs, chips y botones secundarios | `inputBackground` (blanco 0.5) |
| Fondo de modales y paneles | `panelBackground` (blanco 0.45) |
| Fondo de acción destructiva | `dangerBackground` |
| Círculos de color | `orbPink`, `orbOrange`, `orbPurple` |

No escribas `rgba(...)` ni `#hex` dentro de un componente: si falta un color, agrégalo como token en `theme.ts`.

Espaciado: `Spacing.two` (8) entre elementos, `Spacing.three` (16) padding de cards, `Spacing.four` (24) padding de pantallas.

## Efecto glass

El blur solo se nota si hay color detrás. Reglas:

1. Usa `GlassCard` para las tarjetas.
2. Pon círculos de colores (`position: 'absolute'`, `borderRadius: 999`, `pointerEvents="none"`) entre el fondo y el contenido. Ejemplo en `src/app/index.tsx`.
3. Los gradientes sobre una `GlassCard` van translúcidos (~0.7), no sólidos.
4. Fondos de paneles y modales con poca opacidad (~0.45), nunca ~0.95.

En Android el blur de `expo-blur` es solo una aproximación; en iOS 26+ existe el Liquid Glass real con `GlassView` de `expo-glass-effect` (no usado todavía).

## Patrones

- **Pantalla:** `LinearGradient` de fondo + círculos + `SafeAreaView` (de `react-native-safe-area-context`) + contenido con `paddingHorizontal: Spacing.four`. Ver `src/app/index.tsx`.
- **Items de lista:** `GlassCard` dentro de `Animated.View` con `entering={FadeInDown.delay(index * 100).springify()}`. Ver `ExpenseItem.tsx`.
- **Botones principales:** `LinearGradient` primary → secondary con `start={{x:0,y:0}} end={{x:1,y:1}}`. Ver el FAB en `index.tsx`.
- **Modal bottom sheet:** copiar la estructura de `AddExpenseModal.tsx` (backdrop con blur, `SlideInDown`, handle, `ScrollView`).
- **Inputs:** fondo `inputBackground`, `borderWidth: 1`, `glassBorder`, `borderRadius: Spacing.two`.
- **Chips de selección** (categorías, orden de la lista): el activo con gradiente `primary` y texto `glassTextLight`; los demás con `inputBackground` y texto `glassText`.
- **Errores de formulario:** borde `secondary` (1.5) en el campo y texto 12/600 `secondary` debajo. Los obligatorios llevan ` *` en la etiqueta. Ver `AddExpenseModal.tsx`.
- **Acción destructiva:** borde y texto `secondary`, fondo `dangerBackground`, siempre con `Alert` de confirmación.

## Teclado (importante)

Todo modal o pantalla con inputs usa `KeyboardAvoidingView` (`'padding'` en iOS, `'height'` en Android) y un `ScrollView` con `keyboardShouldPersistTaps="handled"`, para que el teclado no tape los campos y los botones sigan funcionando.

## Tipografía

- Título de pantalla: 28, bold, `glassText`.
- Números grandes: 42, bold, `letterSpacing: -1`, `glassTextLight`.
- Texto secundario: `glassTextSecondary`.

## Checklist

- [ ] Fondo con gradiente y círculos de color
- [ ] Cards con `GlassCard`
- [ ] Gradientes translúcidos sobre cards, paneles con poca opacidad
- [ ] Colores y espaciado desde `theme.ts`, sin valores sueltos
- [ ] Inputs: `ScrollView` + `KeyboardAvoidingView`
