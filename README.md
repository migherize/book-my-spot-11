# AgendaPro

## Mock profesional actual

El flujo mock de onboarding profesional usa esta key en `localStorage`:

```txt
agendapro_professional_mock_v1
```

Y este shape base para `professionalStatus`:

```json
{
  "professionalName": "Dra. Paula Ortega",
  "specialty": "Psicología",
  "location": "Madrid, España",
  "description": "Atención personalizada para terapia online y presencial.",
  "categoryType": "wellness",
  "subcategoryId": "psychology",
  "freeBookingLimit": 5,
  "freeBookingsUsed": 0,
  "subscriptionActive": false,
  "onboardingCompleted": true
}
```

Este mock se integra en el estado global para soportar tanto el flujo cliente como el de convertirse en profesional.
