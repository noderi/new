CREATE TABLE `licenses` (
  `license` varchar(75) NOT NULL,
  `expire` varchar(30) NOT NULL,
  `hwid` varchar(99) NOT NULL,
  `created` varchar(25) NOT NULL,
  `owner` varchar(30) NOT NULL,
  PRIMARY KEY (`license`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;