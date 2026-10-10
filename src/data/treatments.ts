export type Treatment = {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  durationMax: number;
  description: string;
  active: boolean;
};

export const treatments: Treatment[] = [
  {
    id: "1",
    name: "Evaluación/Consulta Dental",
    price: 20,
    durationMin: 20,
    durationMax: 30,
    description:
      "Revisión general de dientes y encías para conocer el estado de la salud bucal y recomendar el tratamiento adecuado.",
    active: true,
  },
  {
    id: "2",
    name: "Limpieza dental básica",
    price: 25,
    durationMin: 30,
    durationMax: 45,
    description:
      "Eliminación de placa, sarro leve y manchas superficiales para mantener una adecuada higiene bucal.",
    active: true,
  },
  {
    id: "3",
    name: "Limpieza dental profunda",
    price: 40,
    durationMin: 45,
    durationMax: 60,
    description:
      "Limpieza especializada para eliminar acumulaciones de placa y sarro debajo de la línea de las encías.",
    active: true,
  },
  {
    id: "4",
    name: "Relleno de resina",
    price: 35,
    durationMin: 30,
    durationMax: 45,
    description:
      "Restauración del diente mediante resina para reparar daños ocasionados principalmente por caries.",
    active: true,
  },
  {
    id: "5",
    name: "Reconstrucción Dental",
    price: 50,
    durationMin: 45,
    durationMax: 60,
    description:
      "Restauración de una pieza dental que ha sufrido una pérdida considerable de su estructura.",
    active: true,
  },
  {
    id: "6",
    name: "Extracción dental simple",
    price: 50,
    durationMin: 30,
    durationMax: 45,
    description:
      "Retiro de una pieza dental que no requiere un procedimiento quirúrgico complejo.",
    active: true,
  },
  {
    id: "7",
    name: "Extracción de cordal",
    price: 130,
    durationMin: 45,
    durationMax: 90,
    description:
      "Procedimiento para retirar una muela del juicio cuando su extracción es necesaria.",
    active: true,
  },
  {
    id: "8",
    name: "Endodoncia",
    price: 200,
    durationMin: 60,
    durationMax: 90,
    description:
      "Tratamiento del interior del diente para eliminar tejido afectado y ayudar a conservar la pieza dental.",
    active: true,
  },
  {
    id: "9",
    name: "Blanqueamiento Dental",
    price: 100,
    durationMin: 60,
    durationMax: 90,
    description:
      "Tratamiento estético para aclarar el tono de los dientes y mejorar la apariencia de la sonrisa.",
    active: true,
  },
];