import { User } from '../../features/users/user.entity';
import { setSeederFactory } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';

export default setSeederFactory(User, async (faker) => {
  const user = new User();

  const sexFlag = faker.number.int(1);
  const sex: 'male' | 'female' = sexFlag ? 'male' : 'female';

  user.first_name = faker.person.firstName(sex);
  user.last_name = faker.person.lastName(sex);
  user.email = faker.internet.email(user.first_name, user.last_name).toLowerCase();
  user.phonenumber = faker.phone.number('+229 01 ## ## ## ##');
  user.addresses = [
    {
      country: faker.location.country(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postal_code: faker.location.zipCode(),
      phone: user.phonenumber,
      email: user.email,
    },
  ];
  user.password = await bcrypt.hash('password', 10);
  user.createdAt = faker.date.between({ from:"2024-04-01", to:"2025-02-16"});
  user.updatedAt = user.createdAt;

  return user;
});
