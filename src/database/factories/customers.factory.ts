import { User } from '../../features/users/user.entity';
import { setSeederFactory } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';

export default setSeederFactory(User, async (faker) => {
  const user = new User();

  const sexFlag = faker.number.int(1);
  const sex: 'male' | 'female' = sexFlag ? 'male' : 'female';

  user.first_name = faker.person.firstName(sex);
  user.last_name = faker.person.lastName(sex);
  user.email = user.last_name.charAt(0) + user.first_name.split(' ')[0] + "@gmail.com"
  user.phonenumber = faker.phone.number()
  user.addresses = [
    {
        country: faker.location.country(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        postal_code: faker.location.zipCode(),
        phone: user.phonenumber,
        email: user.email
    }
  ]
  user.password = await bcrypt.hash("password", 10)

  return user;
});
