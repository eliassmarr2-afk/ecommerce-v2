/**
 * THE CAMPING — V1 local catalog adapter
 *
 * Boundary intentionally kept separate from the UI.
 * Protocol Data V2 (or another commerce backend) can replace this adapter later
 * while preserving the page rendering contract.
 */
(function () {
  "use strict";

  const categories = [
    { id: "combos", label: "Combos", icon: "⛺" },
    { id: "inflables", label: "Inflables", icon: "◯" },
    { id: "carpas", label: "Carpas", icon: "△" },
    { id: "pesca", label: "Pesca", icon: "⌁" },
    { id: "anafes", label: "Anafes", icon: "♨" },
    { id: "parrillas", label: "Parrillas", icon: "▦" },
    { id: "sillas", label: "Sillas", icon: "⌑" }
  ];

  const products = [
    {
      id: "combo-escapada-2",
      category: "combos",
      title: "Combo Escapada para 2",
      subtitle: "Carpa + sillas + anafe portátil",
      price: 189990,
      oldPrice: 229990,
      rating: 4.5,
      reviews: 128,
      buyers: 420,
      deliveryDays: 2,
      deliveryLabel: "Llega entre mañana y el sábado",
      badge: "Más elegido",
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=82",
      description: "Un equipo inicial práctico para una escapada de dos personas. La selección combina refugio, descanso y cocina compacta en una sola compra.",
      features: ["Carpa para 2 personas", "2 sillas plegables", "Anafe portátil", "Bolso de guardado"],
      stock: 18
    },
    {
      id: "carpa-patagonia-4",
      category: "carpas",
      title: "Carpa Patagonia 4P",
      subtitle: "Doble techo · armado rápido",
      price: 149900,
      oldPrice: 179900,
      rating: 4.5,
      reviews: 94,
      buyers: 310,
      deliveryDays: 2,
      deliveryLabel: "Llega en 24 a 48 h",
      badge: "Ideal familias",
      image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=82",
      description: "Carpa espaciosa para hasta cuatro personas, pensada para escapadas de fin de semana y campings organizados.",
      features: ["Capacidad para 4", "Doble techo", "Mosquitero frontal", "Bolso compacto"],
      stock: 9
    },
    {
      id: "silla-director-nomade",
      category: "sillas",
      title: "Silla Director Nómade",
      subtitle: "Plegable · apoyabrazos reforzados",
      price: 42990,
      oldPrice: 49990,
      rating: 4.5,
      reviews: 76,
      buyers: 590,
      deliveryDays: 1,
      deliveryLabel: "Despacho en el día",
      badge: "Entrega rápida",
      image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1200&q=82",
      description: "Silla plegable de camping de armado instantáneo, liviana para transportar y firme para jornadas largas.",
      features: ["Estructura plegable", "Tela resistente", "Bolsa de transporte", "Apoyabrazos"],
      stock: 34
    },
    {
      id: "anafe-trail-fire",
      category: "anafes",
      title: "Anafe Trail Fire",
      subtitle: "Compacto · encendido rápido",
      price: 38990,
      oldPrice: 45990,
      rating: 4.5,
      reviews: 61,
      buyers: 270,
      deliveryDays: 1,
      deliveryLabel: "Despacho en el día",
      badge: "Compacto",
      image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1200&q=82",
      description: "Anafe portátil pensado para cocinar de forma simple durante una salida. Su formato compacto ocupa poco lugar en el equipo.",
      features: ["Encendido rápido", "Soporte estable", "Formato compacto", "Perilla de regulación"],
      stock: 22
    },
    {
      id: "parrilla-fold-45",
      category: "parrillas",
      title: "Parrilla Fold 45",
      subtitle: "Plegable · acero reforzado",
      price: 67990,
      oldPrice: 79990,
      rating: 4.5,
      reviews: 49,
      buyers: 185,
      deliveryDays: 3,
      deliveryLabel: "Llega entre 2 y 3 días",
      badge: "Para el fogón",
      image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1200&q=82",
      description: "Parrilla plegable para llevar en el baúl y montar junto al fogón. Diseñada para reducir volumen durante el traslado.",
      features: ["Acero reforzado", "Patas plegables", "Rejilla desmontable", "Fácil limpieza"],
      stock: 12
    },
    {
      id: "kit-pesca-rio",
      category: "pesca",
      title: "Kit Pesca de Río",
      subtitle: "Caña + reel + accesorios",
      price: 84990,
      oldPrice: 99990,
      rating: 4.5,
      reviews: 87,
      buyers: 233,
      deliveryDays: 2,
      deliveryLabel: "Llega en 24 a 48 h",
      badge: "Kit completo",
      image: "https://images.unsplash.com/photo-1514467911470-92d2c828d80b?auto=format&fit=crop&w=1200&q=82",
      description: "Kit inicial para pesca recreativa de río con los componentes esenciales reunidos en una sola selección.",
      features: ["Caña telescópica", "Reel frontal", "Línea inicial", "Set de accesorios"],
      stock: 15
    },
    {
      id: "colchon-inflable-doble",
      category: "inflables",
      title: "Colchón Inflable Doble",
      subtitle: "Doble plaza · válvula rápida",
      price: 59990,
      oldPrice: 69990,
      rating: 4.5,
      reviews: 112,
      buyers: 640,
      deliveryDays: 1,
      deliveryLabel: "Despacho en el día",
      badge: "Top descanso",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82",
      description: "Colchón inflable doble para sumar confort sin ocupar demasiado espacio durante el traslado.",
      features: ["Doble plaza", "Válvula rápida", "Superficie aterciopelada", "Guardado compacto"],
      stock: 27
    }
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  window.TheCampingCatalog = {
    async getCategories() {
      return clone(categories);
    },
    async getProducts() {
      return clone(products);
    },
    async getProductById(id) {
      return clone(products.find((product) => product.id === id) || products[0]);
    }
  };
})();