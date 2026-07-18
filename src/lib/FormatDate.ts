export default function formatDate(dateStr: string): string {
  const date = new Date(dateStr);

  const day = date.getDate();

  // ordinal suffix logic
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short", // Thu
    month: "short", // Jan
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const [weekday, month] = formatter.format(date).split(" ");

  return `${weekday}, ${month} ${day}${suffix}, ${date.getFullYear()}`;
}

// Example:
console.log(formatDate("2025-01-12"));
// Thu, Jan 12th, 2025
