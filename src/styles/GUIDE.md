# Guía de Estilos Globales Greenloop Mobile

## 1. Colores
Usa siempre los colores definidos en `src/styles/theme.ts`:
- **Principal:** `colors.primary` (`#388e3c`)
- **Secundario/acento:** `colors.accent` (`#ff9800`)
- **Éxito:** `colors.success`
- **Error:** `colors.error`
- **Fondo:** `colors.background`
- **Texto principal:** `colors.black`
- **Texto secundario:** `colors.gray`
- **Tarjetas/fondos claros:** `colors.white`, `colors.primaryLight`

**Ejemplo:**
```ts
backgroundColor: colors.primary
color: colors.gray
```

---

## 2. Tipografía
- Usa siempre la fuente del sistema (`fonts.regular` o `fonts.bold`).
- Tamaños:
  - **Títulos:** `fontSizes.title` (24)
  - **Subtítulos:** `fontSizes.subtitle` (18)
  - **Texto normal:** `fontSizes.body` (15)
  - **Texto pequeño:** `fontSizes.small` (12)

**Ejemplo:**
```ts
fontSize: fontSizes.title
fontWeight: 'bold'
```

---

## 3. Espaciados y márgenes
- Usa los valores de `spacing` para paddings y márgenes:
  - `spacing.xs` (4), `spacing.sm` (8), `spacing.md` (16), `spacing.lg` (24), `spacing.xl` (32)
- No uses valores hardcodeados como `padding: 17` o `margin: 13`.

**Ejemplo:**
```ts
padding: spacing.md
marginBottom: spacing.lg
```

---

## 4. Bordes y esquinas redondeadas
- Usa los valores de `borderRadius`:
  - `borderRadius.sm` (6), `borderRadius.md` (12), `borderRadius.lg` (24)
- Todas las tarjetas, botones y modales deben tener bordes redondeados consistentes.

**Ejemplo:**
```ts
borderRadius: borderRadius.md
```

---

## 5. Sombra y elevación
- Usa el objeto `shadow` para tarjetas y elementos elevados.
- No repitas la configuración de sombra en cada componente.

**Ejemplo:**
```ts
...shadow
```

---

## 6. Componentes reutilizables
- Si un estilo se repite en más de 2 componentes, centralízalo en un archivo en `styles/` (por ejemplo, `CardStyle.ts`).
- Ejemplo: todas las tarjetas usan el mismo fondo, borde y sombra.

---

## 7. Nombres de clases y convenciones
- Usa nombres descriptivos y en inglés para los estilos: `container`, `title`, `card`, `button`, `input`, etc.
- No uses nombres genéricos como `box1`, `text2`, etc.

---

## 8. No uses valores hardcodeados
- Siempre importa y usa los valores de `theme.ts`.
- Si necesitas un nuevo color/tamaño, agrégalo primero a `theme.ts`.

---

## 9. Accesibilidad
- Asegúrate de que el contraste entre texto y fondo sea suficiente.
- Usa colores de error y éxito para feedback visual claro.

---

## Ejemplo de uso en un componente
```ts
import { colors, fontSizes, spacing, borderRadius, shadow } from '../styles/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadow,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.title,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.gray,
    fontSize: fontSizes.subtitle,
  },
});
```

---

## ¿Qué hacer si necesitas un nuevo estilo global?
1. Agrégalo a `theme.ts`.
2. Usa el nuevo valor en tus componentes. 