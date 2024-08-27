export class FileResponseDto {
  image: {
    name: string;
    url: string;
  };

  constructor(name: string, url: string) {
    this.image = {
      name,
      url,
    };
  }
}
