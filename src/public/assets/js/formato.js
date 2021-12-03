Date fecha = Date();
LocalDate fecha1 = LocalDate.now();
LocalDate fecha2 = LocalDate.of(año, mes, dia);

String obtenerFechaFormateada(LocalDate fecha, String formato) {
    console.log("obtenerFechaFormateada");
    DateTimeFormatter dtf = DateTimeFormatter.ofPattern(formato);
    return fecha.format(dtf);
}