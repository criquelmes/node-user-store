import { Validators } from "../../../config";

export class CreateProductDto {
  private constructor(
    public readonly name: string,
    public readonly available: boolean,
    public readonly price: number,
    public readonly description: string,
    public readonly user: string, // ID
    public readonly category: string // ID
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateProductDto?] {
    const { name, available, price, description, user, category } = object;

    if (!name) return ["Name is required"];

    if (!user) return ["User is required"];
    if (!Validators.isMongoID(user)) return ["Invalid User ID"];

    if (!category) return ["Category is required"];
    if (!Validators.isMongoID(category)) return ["Invalid Category ID"];

    return [
      undefined,
      new CreateProductDto(name, available, price, description, user, category),
    ];
  }
}
