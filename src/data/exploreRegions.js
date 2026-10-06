export const exploreRegions = [
  { slug: "sinsa", name: "신사", imgUrl: "/assets/Sinsa.png" },
  { slug: "hyehwa", name: "혜화", imgUrl: "/assets/Hyehwa.png" },
  { slug: "seochon", name: "서촌", imgUrl: "/assets/Seochon.png" },
  { slug: "hannam", name: "한남", imgUrl: "/assets/Hannam.png" },
  { slug: "jongno", name: "종로", imgUrl: "/assets/Jongro.png" },
];

// 지역별 인기 맛집 더미데이터
const categories = ["한식", "일식", "중식", "양식", "카페"];

export const popularRestaurantsByRegion = Object.fromEntries(
  exploreRegions.map((region) => [
    region.slug,
    categories.map((category, index) => ({
      id: `${region.slug}-${index + 1}`,
      rank: index + 1,
      name: `${region.name} 더미 ${index + 1}`,
      category,
      pickCount: [123, 108, 95, 82, 67][index],
      image: "/assets/dummy.png",
    })),
  ]),
);
