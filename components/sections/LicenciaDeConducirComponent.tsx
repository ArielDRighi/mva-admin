"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { es } from "date-fns/locale";
import { format, isAfter, isValid, parse } from "date-fns";

// Tipos de licencias de conducir en Argentina
const CATEGORIAS_LICENCIA = [
  { value: "A1", label: "A1 - Ciclomotores, motocicletas hasta 150cc" },
  { value: "A2", label: "A2 - Motocicletas hasta 300cc" },
  { value: "A3", label: "A3 - Motocicletas de más de 300cc" },
  { value: "B1", label: "B1 - Automóviles, camionetas hasta 3500kg" },
  { value: "B2", label: "B2 - Automóviles con acoplado" },
  { value: "C", label: "C - Camiones sin acoplado" },
  { value: "D1", label: "D1 - Transporte de pasajeros hasta 8 plazas" },
  { value: "D2", label: "D2 - Transporte de pasajeros más de 8 plazas" },
  { value: "E1", label: "E1 - Camiones con acoplado" },
  { value: "E2", label: "E2 - Maquinaria especial no agrícola" },
  { value: "F", label: "F - Vehículos para personas con discapacidad" },
  { value: "G", label: "G - Tractores agrícolas" },
];

// Datos mockeados de la licencia
const LICENCIA_MOCK = {
  licencia_id: 1,
  categoria: "A1",
  fecha_expedicion: "2024-04-12T03:00:00.000Z",
  fecha_vencimiento: "2025-09-05T03:00:00.000Z",
};

const LicenciaDeConducirComponent = () => {
  const [licencia, setLicencia] = useState({
    categoria: "",
    fecha_expedicion: null,
    fecha_vencimiento: null,
  });

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({
    categoria: false,
    fecha_expedicion: false,
    fecha_vencimiento: false,
  });

  // Simulación de carga de datos
  useEffect(() => {
    // Simular una llamada a la API
    setTimeout(() => {
      if (LICENCIA_MOCK) {
        setLicencia({
          categoria: LICENCIA_MOCK.categoria,
          fecha_expedicion: new Date(LICENCIA_MOCK.fecha_expedicion),
          fecha_vencimiento: new Date(LICENCIA_MOCK.fecha_vencimiento),
        });
      }
      setLoading(false);
    }, 800);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLicencia((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar el error al cambiar el valor
    setErrors((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const handleDateChange = (name, date) => {
    setLicencia((prev) => ({
      ...prev,
      [name]: date,
    }));

    // Limpiar el error al cambiar la fecha
    setErrors((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const validateForm = () => {
    const newErrors = {
      categoria: !licencia.categoria,
      fecha_expedicion:
        !licencia.fecha_expedicion ||
        !isValid(new Date(licencia.fecha_expedicion)),
      fecha_vencimiento:
        !licencia.fecha_vencimiento ||
        !isValid(new Date(licencia.fecha_vencimiento)) ||
        !isAfter(
          new Date(licencia.fecha_vencimiento),
          new Date(licencia.fecha_expedicion)
        ),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Simular guardado de datos
    setLoading(true);
    setTimeout(() => {
      // Aquí iría la llamada a la API para guardar los cambios
      console.log("Datos guardados:", licencia);
      setEditMode(false);
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Licencia de conducir actualizada con éxito",
        severity: "success",
      });
    }, 1000);
  };

  const handleCancel = () => {
    // Restaurar datos originales
    if (LICENCIA_MOCK) {
      setLicencia({
        categoria: LICENCIA_MOCK.categoria,
        fecha_expedicion: new Date(LICENCIA_MOCK.fecha_expedicion),
        fecha_vencimiento: new Date(LICENCIA_MOCK.fecha_vencimiento),
      });
    }
    setEditMode(false);
    setErrors({
      categoria: false,
      fecha_expedicion: false,
      fecha_vencimiento: false,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const calcularDiasRestantes = () => {
    if (!licencia.fecha_vencimiento) return null;

    const hoy = new Date();
    const vencimiento = new Date(licencia.fecha_vencimiento);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  const diasRestantes = calcularDiasRestantes();

  return (
    <Card
      sx={{
        maxWidth: 600,
        margin: "auto",
        mt: 4,
        borderRadius: 4,
        background: "linear-gradient(to right, #e3f2fd, #bbdefb)",
        boxShadow: 3,
        transition: "all 0.3s ease",
        border: "2px solid #2196f3",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: 6,
        },
      }}
    >
      <CardHeader
        title="Licencia de Conducir"
        subheader="Carnet del Conductor"
        sx={{
          backgroundColor: "#1976d2",
          color: "white",
          textAlign: "center",
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          py: 2,
        }}
      />

      <Divider />

      <CardContent sx={{ px: 4, py: 3 }}>
        {loading ? (
          <Typography>Cargando información...</Typography>
        ) : (
          <>
            {diasRestantes !== null && diasRestantes < 60 && (
              <Alert
                severity={diasRestantes < 30 ? "error" : "warning"}
                sx={{ mb: 3 }}
              >
                {diasRestantes < 0
                  ? "La licencia ha vencido"
                  : `La licencia vence en ${diasRestantes} días`}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={errors.categoria}
                  disabled={!editMode}
                >
                  <InputLabel id="categoria-label">Categoría</InputLabel>
                  <Select
                    labelId="categoria-label"
                    name="categoria"
                    value={licencia.categoria}
                    onChange={handleChange}
                    label="Categoría"
                  >
                    {CATEGORIAS_LICENCIA.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.categoria && (
                    <FormHelperText>La categoría es obligatoria</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={es}
                >
                  <DatePicker
                    label="Fecha de expedición"
                    value={licencia.fecha_expedicion}
                    onChange={(date) =>
                      handleDateChange("fecha_expedicion", date)
                    }
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: errors.fecha_expedicion,
                        helperText: errors.fecha_expedicion
                          ? "Fecha de expedición inválida"
                          : "",
                        disabled: !editMode,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={es}
                >
                  <DatePicker
                    label="Fecha de vencimiento"
                    value={licencia.fecha_vencimiento}
                    onChange={(date) =>
                      handleDateChange("fecha_vencimiento", date)
                    }
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: errors.fecha_vencimiento,
                        helperText: errors.fecha_vencimiento
                          ? "Fecha inválida o anterior a la expedición"
                          : "",
                        disabled: !editMode,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              {!editMode && licencia.fecha_expedicion && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      backgroundColor: "#f0f0f0",
                      p: 2,
                      borderRadius: 2,
                      mt: 2,
                    }}
                  >
                    <Typography variant="body2">
                      <strong>Expedida el:</strong>{" "}
                      {format(
                        new Date(licencia.fecha_expedicion),
                        "dd/MM/yyyy"
                      )}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Válida hasta:</strong>{" "}
                      {format(
                        new Date(licencia.fecha_vencimiento),
                        "dd/MM/yyyy"
                      )}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={
                        diasRestantes < 0
                          ? "error"
                          : diasRestantes < 30
                          ? "error.main"
                          : diasRestantes < 60
                          ? "warning.main"
                          : "success.main"
                      }
                    >
                      <strong>Estado:</strong>{" "}
                      {diasRestantes < 0
                        ? "Vencida"
                        : diasRestantes < 30
                        ? "Por vencer (menos de 30 días)"
                        : diasRestantes < 60
                        ? "Advertencia (menos de 60 días)"
                        : "Vigente"}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            {editMode && (
              <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ mr: 2 }}
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Guardar
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LicenciaDeConducirComponent;
